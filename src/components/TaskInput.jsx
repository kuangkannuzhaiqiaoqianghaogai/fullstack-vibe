// src/components/TaskInput.jsx
import React from 'react'

// 这里的 { ... } 就是从父组件接收的“电源线”
function TaskInput({ newTask, setNewTask, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={newTask}
        // 当用户打字时，通过电线告诉父组件更新数据
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="今天最重要的三件事..."
      />
      <button type="submit">Add Task</button>
    </form>
  )
}

export default TaskInput