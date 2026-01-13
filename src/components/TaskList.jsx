// src/components/TaskList.jsx
import React from 'react'

function TaskList({ tasks, toggleTask, deleteTask }) {
  return (
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
  )
}

export default TaskList