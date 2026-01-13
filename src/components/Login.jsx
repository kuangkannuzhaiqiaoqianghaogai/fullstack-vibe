// src/components/Login.jsx
import React, { useState } from 'react'
import { API_URL } from '../config'

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  // 👇 新增：控制当前是“登录模式”还是“注册模式”
  const [isRegistering, setIsRegistering] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    try {
      if (isRegistering) {
        // --- 🟢 注册逻辑 (发 JSON) ---
        const res = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        })
        const data = await res.json()
        
        if (!res.ok) throw new Error(data.detail || '注册失败')
        
        // 注册成功后，自动切回登录模式，并提示用户
        setSuccessMsg('🎉 注册成功！请登录')
        setIsRegistering(false) // 切回登录界面
        setPassword('') // 清空密码让用户重输

      } else {
        // --- 🔵 登录逻辑 (发表单) ---
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        const res = await fetch(`${API_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData
        })
        const data = await res.json()

        if (!res.ok) throw new Error(data.detail || '账号或密码错啦')

        // 登录成功
        localStorage.setItem('vibe_token', data.access_token)
        onLoginSuccess()
      }

    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ maxWidth: '300px', margin: '100px auto', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '20px' }}>
        {isRegistering ? '📝 新用户注册' : '🔐 请先登录'}
      </h1>

      {successMsg && <div style={{ color: '#4caf50', marginBottom: '10px', background: '#e8f5e9', padding: '10px', borderRadius: '5px' }}>{successMsg}</div>}
      {error && <div style={{ color: '#f44336', marginBottom: '10px', background: '#ffebee', padding: '10px', borderRadius: '5px' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          placeholder="用户名 / Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="密码 / Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }}
        />
        
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            borderRadius: '8px', 
            border: 'none', 
            background: isRegistering ? '#2196F3' : '#673AB7', // 注册用蓝色，登录用紫色
            color: 'white', 
            fontSize: '16px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'background 0.3s'
          }}
        >
          {isRegistering ? '注册并提交 (Register)' : '登录 (Login)'}
        </button>
      </form>

      {/* 👇 切换模式的按钮 */}
      <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
        {isRegistering ? '已有账号？' : '还没有账号？'}
        <span 
          onClick={() => {
            setIsRegistering(!isRegistering)
            setError('')
            setSuccessMsg('')
          }}
          style={{ color: '#2196F3', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }}
        >
          {isRegistering ? '直接登录' : '点击注册'}
        </span>
      </p>
    </div>
  )
}

export default Login