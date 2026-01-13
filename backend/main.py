# backend/main.py
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

app = FastAPI()

# --- ☁️ 数据库设置 (保持不变) ---
if os.getenv("RENDER"):
    DATABASE_URL = "sqlite:///./sql_app.db"
    connect_args = {"check_same_thread": False}
else:
    # 你的本地数据库
    DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/fullstack_vibe"
    connect_args = {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- 🧠 1. 定义更聪明的数据库模型 ---
class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(200))
    is_done = Column(Boolean, default=False)
    # 👇 新增：用来存分类标签
    category = Column(String(50), default="日常")

# --- ⚠️ 重要：每次改了模型，本地最好删掉旧的 sql_app.db 让它重新生成 ---
Base.metadata.create_all(bind=engine)

class TaskCreate(BaseModel):
    content: str

class TaskUpdate(BaseModel):
    is_done: bool

# --- 🧠 2. 增加“智能分类”逻辑函数 ---
def classify_content(content: str) -> str:
    # 这里就是后端的“大脑”
    text = content.lower() # 转小写，方便匹配
    if any(k in text for k in ["买", "购", "超市", "buy", "shop"]):
        return "🛒 购物"
    if any(k in text for k in ["学", "习", "书", "code", "py", "react", "bug"]):
        return "💻 学习"
    if any(k in text for k in ["跑", "健身", "运动", "gym", "run"]):
        return "💪 运动"
    return "📌 日常" # 默认分类

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 接口部分 ---

@app.get("/tasks/")
def read_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.post("/tasks/")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    # --- 🧠 3. 在保存前，先调用智能函数 ---
    auto_category = classify_content(task.content)
    
    # 存入数据库时，把算出来的 category 也存进去
    db_task = Task(content=task.content, category=auto_category)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    db_task.is_done = task_update.is_done
    db.commit()
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="任务不存在")
    db.delete(db_task)
    db.commit()
    return {"message": "删除成功"}