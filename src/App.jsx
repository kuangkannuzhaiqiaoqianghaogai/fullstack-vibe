import React, { useState, useEffect } from 'react'
import { API_URL } from './config' // 👈 这里引入了你刚创建的配置文件

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")

  // 1. 获取任务列表
  const fetchTasks = () => {
    // 使用 API_URL 变量拼接地址
    fetch(`${API_URL}/tasks/`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("连接失败:", err))
  }

  useEffect(() => { fetchTasks() }, [])

  // 2. 添加任务
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTask) return
    
    fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newTask })
    }).then(() => {
      setNewTask("")
      fetchTasks()
    })
  }

  // 3. 切换状态 (打勾)
  const toggleTask = (id, currentStatus) => {
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: !currentStatus })
    }).then(() => fetchTasks())
  }

  // 4. 删除任务
  const deleteTask = (id) => {
    fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
      .then(() => fetchTasks())
  }

  return (
    <div>
      <h1>🚀 通哥的秘密基地</h1>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="今天最重要的三件事"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            <span 
              onClick={() => toggleTask(task.id, task.is_done)}
              style={{ 
                textDecoration: task.is_done ? 'line-through' : 'none',
                color: task.is_done ? '#666' : 'white',
                cursor: 'pointer',
                flex: 1,
                textAlign: 'left'
              }}
            >
              {task.is_done ? '✨' : '⬜️'} {task.content}
            </span>
            <button className="delete-btn" onClick={() => deleteTask(task.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App