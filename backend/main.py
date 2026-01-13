import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel

app = FastAPI()

# --- ☁️ 数据库双模配置 ---
# 逻辑：如果系统里有 DATABASE_URL 环境变量（云端），就用它；
# 否则默认使用 SQLite 文件数据库（./sql_app.db），方便云端直接运行
# 如果你在本地想强制用 MySQL，保持本地开发不变即可，
# 但为了部署方便，我们这里让它默认 fallback 到 SQLite，或者你可以手动保留你的 MySQL 链接
# 为了你本地继续用 MySQL，我把默认值设回你的 MySQL：
DEFAULT_DB = "mysql+pymysql://root:123456@localhost:3306/fullstack_vibe"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_DB)

# SQLite 需要特殊的连接参数
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(String(200))
    is_done = Column(Boolean, default=False)

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
    # ⚠️ 允许所有来源，生产环境建议改成具体的域名，但为了 Vibe Coding 方便，先全开
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

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