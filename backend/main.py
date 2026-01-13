import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

app = FastAPI()

# --- ☁️ 数据库智能切换 (关键修改) ---
# Render 会自动设置 'RENDER' 这个环境变量
if os.getenv("RENDER"):
    # 云端模式：使用 SQLite (无需配置，直接运行)
    print("☁️ 检测到云端环境，使用 SQLite 数据库")
    DATABASE_URL = "sqlite:///./sql_app.db"
    connect_args = {"check_same_thread": False}
else:
    # 本地模式：使用你的 MySQL
    print("🏠 检测到本地环境，使用 MySQL 数据库")
    # ⚠️ 确保这里的密码是你自己的
    DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/fullstack_vibe"
    connect_args = {}

# 创建数据库引擎
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(200))
    is_done = Column(Boolean, default=False)

# 自动建表
Base.metadata.create_all(bind=engine)

class TaskCreate(BaseModel):
    content: str

class TaskUpdate(BaseModel):
    is_done: bool

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 允许前端访问
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 接口定义 ---

@app.get("/tasks/")
def read_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.post("/tasks/")
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    db_task = Task(content=task.content)
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