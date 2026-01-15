// src/api.js
// 统一管理所有 API 请求，自动处理 token
import axios from 'axios'
import { API_URL } from './config'

// 创建 axios 实例
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器：自动添加 token
api.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('vibe_token')
    // 如果有 token，就添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    // 请求错误处理
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response) => {
    // 直接返回响应数据
    return response.data
  },
  (error) => {
    // 处理响应错误
    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('vibe_token')
          // 触发页面刷新，让 App 组件检测到 token 失效
          window.location.reload()
          break
        case 403:
          // 禁止访问
          console.error('禁止访问')
          break
        case 404:
          // 资源不存在
          console.error('资源不存在')
          break
        case 500:
          // 服务器错误
          console.error('服务器错误')
          break
        default:
          console.error(`请求错误：${error.response.status}`)
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 请求配置错误
      console.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

// 🔧 API 方法封装

// 用户认证
export const auth = {
  // 注册
  register: (data) => api.post('/register', data),
  // 登录（使用表单格式）
  login: (data) => api.post('/token', new URLSearchParams(data), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }),
}

// 任务管理
export const tasks = {
  // 获取任务列表
  getTasks: () => api.get('/tasks/'),
  // 创建任务
  createTask: (data) => api.post('/tasks/', data),
  // 更新任务
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  // 批量更新任务排序
  updateTasksSort: (tasks) => api.put('/tasks/sort', tasks),
  // 删除任务
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  // 导出任务
  exportTasks: () => api.get('/tasks/export'),
  // 导入任务
  importTasks: (tasks) => api.post('/tasks/import', tasks),
}

// AI 服务
export const ai = {
  // AI 任务分析
  analyzeTask: (data) => api.post('/ai/analyze', data),
}

// 用户信息
export const user = {
  // 获取当前用户信息
  getCurrentUser: () => api.get('/users/me'),
  // 上传头像
  uploadAvatar: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default api
