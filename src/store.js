// src/store.js
// 使用 Zustand 管理全局状态
import { create } from 'zustand'
import { tasks, ai, user } from './api'
// 直接导入 API_URL，避免动态导入导致的状态更新问题
import { API_URL } from './config'

// 定义 store 的类型和初始状态
const useStore = create((set, get) => ({
  // === 1. 用户状态 ===
  token: localStorage.getItem('vibe_token'),
  username: null,
  avatar_url: null,
  
  // === 2. 任务状态 ===
  tasks: [],
  isLoading: false,
  
  // === 3. 新任务状态 ===
  newTask: '',
  
  // === 4. AI 相关状态 ===
  aiPrompt: '',
  isAiLoading: false,
  
  // === 5. 用户操作方法 ===
  
  // 设置 token
  setToken: (token) => {
    localStorage.setItem('vibe_token', token)
    set({ token })
  },
  
  // 清除 token (退出登录)
  clearToken: () => {
    localStorage.removeItem('vibe_token')
    set({ token: null, tasks: [], newTask: '', aiPrompt: '', username: null, avatar_url: null })
  },
  
  // 获取当前用户信息
  fetchCurrentUser: async () => {
    const { token } = get()
    if (!token) return
    
    set({ isLoading: true })
    try {
      const data = await user.getCurrentUser()
      // 确保头像 URL 是完整的绝对路径
      let avatarUrl = data.avatar_url
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        // 如果是相对路径，添加完整的 API URL
        avatarUrl = `${API_URL}${avatarUrl}`
      }
      // 直接设置状态，确保在方法返回前更新
      set({ 
        username: data.username,
        avatar_url: avatarUrl
      })
      return data
    } catch (err) {
      console.error('获取用户信息失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // 上传头像
  uploadAvatar: async (file) => {
    const { token } = get()
    if (!token) return
    
    set({ isLoading: true })
    try {
      const data = await user.uploadAvatar(file)
      // 确保头像 URL 是完整的绝对路径
      let avatarUrl = data.avatar_url
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        // 如果是相对路径，添加完整的 API URL
        avatarUrl = `${API_URL}${avatarUrl}`
      }
      set({ 
        avatar_url: avatarUrl
      })
      return data
    } catch (err) {
      console.error('上传头像失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // === 6. 任务操作方法 ===
  
  // 获取任务列表
  fetchTasks: async () => {
    const { token } = get()
    if (!token) return
    
    set({ isLoading: true })
    try {
      const data = await tasks.getTasks()
      if (Array.isArray(data)) {
        set({ tasks: data })
      }
    } catch (err) {
      console.error('获取任务失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // 创建新任务
  createTask: async (content) => {
    if (!content) return
    
    const { fetchTasks } = get()
    set({ isLoading: true })
    try {
      await tasks.createTask({ content })
      await fetchTasks()
      set({ newTask: '' })
    } catch (err) {
      console.error('创建任务失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // 更新任务状态
  updateTask: async (id, data) => {
    const { fetchTasks } = get()
    set({ isLoading: true })
    try {
      await tasks.updateTask(id, data)
      await fetchTasks()
    } catch (err) {
      console.error('更新任务失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // 切换任务完成状态（适配TaskList组件）
  toggleTask: async (id, currentStatus) => {
    // 调用updateTask，传递包含is_done字段的对象
    await get().updateTask(id, { is_done: !currentStatus })
  },
  
  // 删除任务
  deleteTask: async (id) => {
    const { fetchTasks } = get()
    set({ isLoading: true })
    try {
      await tasks.deleteTask(id)
      await fetchTasks()
    } catch (err) {
      console.error('删除任务失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // 设置新任务内容
  setNewTask: (newTask) => set({ newTask }),
  
  // === 7. AI 操作方法 ===
  
  // 设置 AI 提示词
  setAiPrompt: (aiPrompt) => set({ aiPrompt }),
  
  // AI 智能分析
  analyzeTask: async () => {
    const { aiPrompt } = get()
    if (!aiPrompt) return
    
    set({ isAiLoading: true })
    try {
      const data = await ai.analyzeTask({ text: aiPrompt })
      set({ newTask: data.title, aiPrompt: '' })
      return data
    } catch (err) {
      console.error('AI 分析失败:', err)
      throw err
    } finally {
      set({ isAiLoading: false })
    }
  }
}))

export default useStore
