// src/App.jsx
import React, { useState, useEffect } from 'react'
import { API_URL } from './config'
import Login from './components/Login'
// 👇 引入 UI 组件
import { Box, Container, VStack, Heading, Button, useToast, Flex, Text } from '@chakra-ui/react'
import TaskInput from './components/TaskInput' // 我们马上优化它
import TaskList from './components/TaskList'   // 我们马上优化它

function App() {
  const [token, setToken] = useState(localStorage.getItem('vibe_token'))
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState("")
  const toast = useToast()

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!newTask) return
    fetch(`${API_URL}/tasks/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content: newTask })
    }).then(() => {
      setNewTask("")
      fetchTasks()
      toast({ title: "任务添加成功", status: "success", duration: 1000 })
    })
  }

  const toggleTask = (id, currentStatus) => {
    fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_done: !currentStatus })
    }).then(() => fetchTasks())
  }

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

          {/* 输入框组件 */}
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