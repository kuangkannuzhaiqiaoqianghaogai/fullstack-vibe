# backend/main.py (终极安全版)
import os
from datetime import datetime, timedelta
from typing import Union, List

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import JWTError, jwt

# --- 配置区域 ---
SECRET_KEY = "vibe_coding_is_awesome_and_secure_key_keep_secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300 # 延长一点过期时间方便测试

app = FastAPI()

# backend/main.py 修改数据库配置部分

# 1. 尝试从环境变量获取数据库地址 (Render 会自动注入这个 DATABASE_URL)
env_db_url = os.getenv("DATABASE_URL")

if env_db_url:
    # --- ☁️ 云端模式 (Render) ---
    # 修正一个小坑：Render 提供的地址通常是 postgres:// 开头，
    # 但 SQLAlchemy 需要 postgresql:// 才能识别，这里做一个自动替换
    if env_db_url.startswith("postgres://"):
        DATABASE_URL = env_db_url.replace("postgres://", "postgresql://", 1)
    else:
        DATABASE_URL = env_db_url
    connect_args = {}
else:
    # --- 🏠 本地模式 (Localhost) ---
    # 这里保持你本地 MySQL 的地址不变
    DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/fullstack_vibe"
    connect_args = {}

# 创建引擎
engine = create_engine(DATABASE_URL, connect_args=connect_args)

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 1. 数据库模型 (Models) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(100))
    # 关联：一个用户有多个任务
    tasks = relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(200))
    is_done = Column(Boolean, default=False)
    category = Column(String(50), default="日常")
    # 👇 新增：主人ID，关联到 User 表
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")

# ⚠️ 注意：这行代码只会在表不存在时创建表。
# 如果表已经存在但结构不一样（比如缺了 owner_id），它不会自动更新！需要手动删库重建。
Base.metadata.create_all(bind=engine)

# --- 2. 安全与工具 ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # 告诉 FastAPI 登录接口在哪

def verify_password(plain, hashed): return pwd_context.verify(plain, hashed)
def get_password_hash(password): return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# --- 3. 核心保安函数 (Dependency) ---
# 这个函数会挂在每个接口门口，负责查验房卡
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None: raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(User).filter(User.username == username).first()
    if user is None: raise credentials_exception
    return user

# --- 4. 数据交互模型 (Pydantic) ---
class TaskCreate(BaseModel):
    content: str

class TaskUpdate(BaseModel):
    is_done: bool
    
class UserCreate(BaseModel):
    username: str
    password: str

# --- 5. 接口 API ---
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user: raise HTTPException(status_code=400, detail="用户名已注册")
    hashed_pw = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    return {"msg": "注册成功"}

@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="用户名或密码错误")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

# 👇 修改：只查“当前用户”的任务
@app.get("/tasks/")
def read_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 这里的 current_user 就是通过 Token 换出来的那个用户
    return db.query(Task).filter(Task.owner_id == current_user.id).all()

# 👇 修改：创建任务时，自动打上“当前用户”的标签
@app.post("/tasks/")
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 简单的自动分类逻辑
    category = "日常"
    if "买" in task.content or "购" in task.content: category = "🛒 购物"
    elif "学" in task.content or "码" in task.content: category = "💻 学习"
    
    # 注意这里：owner_id = current_user.id
    db_task = Task(content=task.content, is_done=False, category=category, owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 只能改“自己的”任务
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not db_task: raise HTTPException(status_code=404, detail="任务找不到或无权修改")
    db_task.is_done = task_update.is_done
    db.commit()
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 只能删“自己的”任务
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not db_task: raise HTTPException(status_code=404, detail="任务找不到或无权删除")
    db.delete(db_task)
    db.commit()
    return {"msg": "删除成功"}