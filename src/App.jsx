import React, { useState, useEffect } from 'react'
import { API_URL } from './config'
// 👇 引入我们亲手做的三个积木
import Header from './components/Header'
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'

function App() {
  // --- 1. 逻辑与数据 (Brain) ---
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")

  const fetchTasks = () => {
    fetch(`${API_URL}/tasks/`)
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error("Error:", err))
  }

  useEffect(() => { fetchTasks() }, [])

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

  const toggleTask = (id, currentStatus) => {
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_done: !currentStatus })
    }).then(() => fetchTasks())
  }

  const deleteTask = (id) => {
    fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' })
      .then(() => fetchTasks())
  }

  // --- 2. 界面组装 (View) ---
  // 你看，现在这里多干净！就像搭积木一样清晰。
  return (
    <div>
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