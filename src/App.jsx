// src/App.jsx
import React, { useState, useEffect } from 'react'
import { API_URL } from './config'
import Login from './components/Login'
// 👇 引入 UI 组件 (增加了 Input, InputGroup 等用于 AI 输入框)
import { 
  Box, Container, VStack, Heading, Button, useToast, Flex, Text, 
  Input, InputGroup, InputRightElement, IconButton 
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons' // 需要安装 @chakra-ui/icons，如果没有可以用文本代替
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'

function App() {
  const [token, setToken] = useState(localStorage.getItem('vibe_token'))
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const toast = useToast()

  // === 🔮 新增：AI 相关状态 ===
  const [aiPrompt, setAiPrompt] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)

  // === 1. 获取任务列表 ===
  const fetchTasks = () => {
    if (!token) return
    fetch(`${API_URL}/tasks/`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => {
        if (res.status === 401) { handleLogout(); throw new Error("失效"); }
        return res.json()
      })
      .then(data => { if (Array.isArray(data)) setTasks(data) })
      .catch(err => console.error(err))
  }

  useEffect(() => { if (token) fetchTasks() }, [token])

  // === 2. 提交新任务 (普通提交) ===
  const handleSubmit = (e) => {
    if(e) e.preventDefault() // 兼容直接调用
    if (!newTask) return
    fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: newTask }) // 目前后端只接收 content，后续可扩展
    }).then(() => {
      setNewTask("")
      fetchTasks()
      toast({ title: "任务添加成功", status: "success", duration: 1000 })
    })
  }

  // === 🔮 新增：AI 智能分析函数 ===
  const handleAiAnalyze = async () => {
    if (!aiPrompt) {
      toast({ title: "请先输入一句话", status: "warning" })
      return
    }
    
    setIsAiLoading(true)
    try {
      // 调用 Day 6 写的 AI 接口
      const res = await fetch(`${API_URL}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiPrompt })
      })

      const data = await res.json()

      if (res.ok) {
        // ✨ 见证奇迹：自动填充 ✨
        // AI 返回的 data.title 自动填入下方的输入框
        setNewTask(data.title) 
        
        // 如果想要更高级的，可以直接把 data.description 也拼接到 data.title 里
        // setNewTask(`${data.title} - ${data.description}`)

        setAiPrompt('') // 清空 AI 输入框
        toast({ 
          title: "AI 识别成功！", 
          description: `优先级: ${data.priority === 3 ? '紧急 🔥' : '普通'}`,
          status: "success",
          position: "top",
          duration: 2000 
        })
      } else {
        toast({ title: "AI 分析失败", status: "error" })
      }
    } catch (error) {
      console.error(error)
      toast({ title: "网络请求错误", status: "error" })
    } finally {
      setIsAiLoading(false)
    }
  }

  // === 3. 更新任务状态 ===
  const toggleTask = (id, currentStatus) => {
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_done: !currentStatus })
    }).then(() => fetchTasks())
  }

  // === 4. 删除任务 ===
  const deleteTask = (id) => {
    fetch(`${API_URL}/tasks/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(() => {
        fetchTasks()
        toast({ title: "已删除", status: "info", duration: 1000 })
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('vibe_token')
    setToken(null)
    setTasks([])
    setNewTask("")
    toast({ title: "已退出登录", position: "top" })
  }

  if (!token) return <Login onLoginSuccess={() => setToken(localStorage.getItem('vibe_token'))} />

  return (
    <Box minH="100vh" bg="gray.50">
      {/* 顶部导航栏 */}
      <Box bg="white" px={4} shadow="sm">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'} maxW="container.md" mx="auto">
          <Heading size="md" color="purple.600">✨ Vibe Tasks</Heading>
          <Button size="sm" colorScheme="gray" onClick={handleLogout}>退出</Button>
        </Flex>
      </Box>

      {/* 主内容区 */}
      <Container maxW="container.md" mt={8}>
        <VStack spacing={8} align="stretch">
          
          {/* 欢迎语 */}
          <Box>
            <Heading size="lg">今天做什么？</Heading>
            <Text color="gray.500">保持专注，逐个击破。</Text>
          </Box>

          {/* 🔮 AI 魔法区域 (新增) */}
          <Box 
            p={5} 
            bg="purple.50" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="purple.100"
            position="relative"
            overflow="hidden"
          >
            {/* 装饰性背景字，为了好看 */}
            <Text 
              position="absolute" right="-10px" top="-10px" 
              fontSize="6xl" opacity="0.1" fontWeight="bold" 
              transform="rotate(10deg)" userSelect="none"
            >
              AI
            </Text>

            <Text mb={3} fontSize="sm" fontWeight="bold" color="purple.700">
              🧠 AI 助手：说句人话，我帮你填表
            </Text>
            
            <InputGroup size="md">
              <Input
                pr="4.5rem"
                bg="white"
                placeholder="例如：周五下午5点前必须把报告发给老板，很急！"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiAnalyze()} // 回车触发
              />
              <InputRightElement width="5.5rem">
                <Button 
                  h="1.75rem" 
                  size="sm" 
                  colorScheme="purple" 
                  onClick={handleAiAnalyze}
                  isLoading={isAiLoading}
                  loadingText="思考中"
                >
                  ✨ 识别
                </Button>
              </InputRightElement>
            </InputGroup>
          </Box>

          {/* 普通输入框组件 (会被 AI 自动填充) */}
          <TaskInput 
            newTask={newTask} 
            setNewTask={setNewTask} 
            handleSubmit={handleSubmit} 
          />

          {/* 列表组件 */}
          <TaskList 
            tasks={tasks} 
            toggleTask={toggleTask} 
            deleteTask={deleteTask} 
          />
          
        </VStack>
      </Container>
    </Box>
  )
}

export default App