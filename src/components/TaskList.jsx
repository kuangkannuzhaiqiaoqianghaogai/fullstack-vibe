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
            {/* 如果有 category 就显示一个小胶囊标签 */}
            {task.category && (
            <span style={{ 
                fontSize: '0.8em', 
                backgroundColor: '#333', 
                padding: '2px 6px', 
                borderRadius: '4px', 
                marginRight: '8px',
                color: '#aaa'
            }}>
                {task.category}
            </span>
            )}

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