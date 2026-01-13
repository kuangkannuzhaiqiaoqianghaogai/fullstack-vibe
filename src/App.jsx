import React, { useState, useEffect } from 'react'
import { API_URL } from './config'
import Header from './components/Header'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import Login from './components/Login'

function App() {
  // --- 1. 所有的 Hooks 必须放在最前面 ---
  const [token, setToken] = useState(localStorage.getItem('vibe_token'))
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")

  // 定义 fetchTasks (因为 useEffect 要用它，所以要放在 useEffect 前面)
  const fetchTasks = () => {
    // 如果没有 token，根本不需要去请求后端，直接跳过
    if (!token) return

    fetch(`${API_URL}/tasks/`, {
      // 👇 关键：发请求时要带上房卡！
      headers: {
        'Authorization': `Bearer ${token}` 
      }
    })
      .then(res => {
        if (res.status === 401) {
          // 如果后端说房卡无效 (401)，那就强制退出
          handleLogout()
          throw new Error("Token过期")
        }
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) setTasks(data)
      })
      .catch(err => console.error(err))
  }

  // ✅ useEffect 必须放在 if return 之前！
  useEffect(() => {
    if (token) {
      fetchTasks()
    }
  }, [token]) // 只要 token 变了（比如刚登录），就去拉取数据

  // --- 其他业务逻辑 ---
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTask) return
    fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 带房卡
      },
      body: JSON.stringify({ content: newTask })
    }).then(() => {
      setNewTask("")
      fetchTasks()
    })
  }

  const toggleTask = (id, currentStatus) => {
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // 带房卡
      },
      body: JSON.stringify({ is_done: !currentStatus })
    }).then(() => fetchTasks())
  }

  const deleteTask = (id) => {
    fetch(`${API_URL}/tasks/${id}`, { 
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${token}` // 带房卡
      }
    })
      .then(() => fetchTasks())
  }

  const handleLogout = () => {
    localStorage.removeItem('vibe_token')
    setToken(null)
  }

  // --- 2. 门卫逻辑：只有在所有 Hooks 执行完之后，才能决定要不要“赶人” ---
  if (!token) {
    return <Login onLoginSuccess={() => setToken(localStorage.getItem('vibe_token'))} />
  }

  // --- 3. 正常界面 ---
  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={handleLogout}
        style={{ position: 'absolute', top: 0, right: 0, padding: '5px 10px', fontSize: '12px', cursor: 'pointer' }}
      >
        退出登录
      </button>

      <Header />
      
      <TaskInput 
        newTask={newTask} 
        setNewTask={setNewTask} 
        handleSubmit={handleSubmit} 
      />

      <TaskList 
        tasks={tasks} 
        toggleTask={toggleTask} 
        deleteTask={deleteTask} 
      />
    </div>
  )
}

export default App