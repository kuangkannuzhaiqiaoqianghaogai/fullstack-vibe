// src/store.js
// 使用 Zustand 管理全局状态
import { create } from 'zustand'
import { taskApi, ai } from './api'

// 定义 store 的类型和初始状态
const useStore = create((set, get) => ({
  // === 1. 用户状态 ===
  token: localStorage.getItem('vibe_token'),
  username: null,
  
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
    set({ token: null, tasks: [], newTask: '', aiPrompt: '' })
  },
  
  // === 6. 任务操作方法 ===
  
  // 获取任务列表
  fetchTasks: async () => {
    const { token } = get()
    if (!token) return
    
    set({ isLoading: true })
    try {
      const data = await taskApi.getTasks()
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
      await taskApi.createTask({ content })
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
  updateTask: async (id, is_done) => {
    const { fetchTasks } = get()
    set({ isLoading: true })
    try {
      await taskApi.updateTask(id, { is_done })
      await fetchTasks()
    } catch (err) {
      console.error('更新任务失败:', err)
      throw err
    } finally {
      set({ isLoading: false })
    }
  },
  
  // 删除任务
  deleteTask: async (id) => {
    const { fetchTasks } = get()
    set({ isLoading: true })
    try {
      await taskApi.deleteTask(id)
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
