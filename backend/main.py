# backend/main.py (终极修正版)
import os
from datetime import datetime, timedelta
from typing import Union, List

# 1. 引入 dotenv，确保能读取 .env 文件
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm

from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
from jose import JWTError, jwt

# 导入 AI 函数
from ai_agent import analyze_task_text

# --- 配置区域 ---
SECRET_KEY = os.getenv("SECRET_KEY", "vibe_coding_secret_key_123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 300

app = FastAPI()

# --- 允许跨域 (CORS) ---
# 👇 修改这一段 CORS 配置
app.add_middleware(
    CORSMiddleware,
    # 🔴 把原来的 ["http://localhost:5173", ...] 删掉
    # 🟢 改成 ["*"]，代表允许任何地址（5173, 5174, 5175... 统统放行）
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 静态文件服务 ---
# 创建uploads目录
os.makedirs("uploads", exist_ok=True)
# 挂载静态文件服务
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# --- 数据库配置 ---
# 优先从 .env 获取，如果没有则使用默认值
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./vibe_tasks.db")

# Render 部署兼容性处理
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 创建引擎
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 1. 数据库模型 (Models) ---
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    hashed_password = Column(String(100))
    avatar_url = Column(String(200), default="")
    tasks = relationship("Task", back_populates="owner")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(200))
    is_done = Column(Boolean, default=False)
    category = Column(String(50), default="日常")
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")

# 创建表结构
Base.metadata.create_all(bind=engine)

# --- 2. 安全与工具 ---
import bcrypt
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))

def get_password_hash(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

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

# --- 3. Pydantic 模型 ---
class TaskCreate(BaseModel):
    content: str
    category: str = "日常"

class TaskUpdate(BaseModel):
    is_done: bool = None
    content: str = None
    
class UserCreate(BaseModel):
    username: str
    password: str

class AIRequest(BaseModel):
    text: str

# --- 4. 接口 API ---

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

@app.get("/tasks/")
def read_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.owner_id == current_user.id).all()

@app.post("/tasks/")
def create_task(task: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    category = "日常"
    if "买" in task.content or "购" in task.content: category = "🛒 购物"
    elif "学" in task.content or "码" in task.content: category = "💻 学习"
    
    db_task = Task(content=task.content, is_done=False, category=category, owner_id=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not db_task: raise HTTPException(status_code=404, detail="任务找不到或无权修改")
    
    # 只更新提供的字段
    if task_update.is_done is not None:
        db_task.is_done = task_update.is_done
    if task_update.content is not None:
        db_task.content = task_update.content
    
    db.commit()
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    if not db_task: raise HTTPException(status_code=404, detail="任务找不到或无权删除")
    db.delete(db_task)
    db.commit()
    return {"msg": "删除成功"}

# --- 文件上传：头像上传 --- 
@app.post("/upload/avatar")
def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 检查文件类型
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="只能上传图片文件")
    
    # 生成文件名
    filename = f"avatar_{current_user.id}{os.path.splitext(file.filename)[1]}"
    file_path = os.path.join("uploads", filename)
    
    # 保存文件
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    
    # 更新用户头像URL
    current_user.avatar_url = f"/uploads/{filename}"
    db.commit()
    
    # 返回更新后的用户信息
    return {"avatar_url": current_user.avatar_url, "username": current_user.username}

# --- 获取当前用户信息 --- 
@app.get("/users/me")
def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {"username": current_user.username, "avatar_url": current_user.avatar_url}

@app.post("/ai/analyze")
async def analyze_task(request: AIRequest):
    # AI 接口暂不鉴权，方便前端测试
    if not request.text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    result = await analyze_task_text(request.text)
    
    if not result:
        raise HTTPException(status_code=500, detail="AI analysis failed")
        
    return result