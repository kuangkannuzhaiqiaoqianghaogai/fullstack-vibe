// src/components/Header.jsx
import React from 'react'

function Header() {
  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 这里是我们刚才改过的招牌 */}
      <h1>🌞 早安，武桐</h1>
      <p style={{ color: '#888' }}>
        全栈开发之旅 Day 2
      </p>
    </div>
  )
}

// 这一点很重要：把组件“导出”，让别人能用
export default Header