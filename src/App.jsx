// src/App.jsx
import React, { useEffect } from 'react'
import { API_URL } from './config'
import Login from './components/Login'
// 👇 引入 UI 组件 (增加了 Input, InputGroup 等用于 AI 输入框)
import { 
  Box, Container, VStack, HStack, Heading, Button, useToast, Flex, Text, 
  Input, InputGroup, InputRightElement, IconButton, Tabs, TabList, 
  TabPanels, Tab, TabPanel 
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons' // 需要安装 @chakra-ui/icons，如果没有可以用文本代替
import TaskInput from './components/TaskInput'
import TaskList from './components/TaskList'
import Dashboard from './components/Dashboard' // 导入仪表盘组件
import AvatarUpload from './components/AvatarUpload' // 导入头像上传组件
// 👇 引入 Zustand store
import useStore from './store'

function App() {
  // 使用 Zustand store 获取状态和方法
  const {
    token,
    tasks,
    newTask,
    newTaskCategory,
    filterCategory,
    aiPrompt,
    isAiLoading,
    clearToken,
    fetchTasks,
    setNewTask,
    setNewTaskCategory,
    setFilterCategory,
    setAiPrompt,
    analyzeTask,
    toggleTask,
    deleteTask,
    editTask,
    createTask,
    fetchCurrentUser
  } = useStore()
  
  const toast = useToast()

  // 使用 useEffect 触发任务列表和用户信息获取
  useEffect(() => {
    if (token) {
      // 并行获取任务列表和用户信息
      Promise.all([
        fetchTasks().catch(() => {
          toast({ title: "获取任务失败", status: "error", duration: 1500 })
        }),
        fetchCurrentUser().catch(() => {
          toast({ title: "获取用户信息失败", status: "error", duration: 1500 })
        })
      ])
    }
  }, [token, fetchTasks, fetchCurrentUser, toast])

  // === 2. 提交新任务 (普通提交) ===
  const handleSubmit = async (e) => {
    e.preventDefault() // 兼容直接调用
    try {
      await createTask()
      toast({ title: "任务添加成功", status: "success", duration: 1000 })
    } catch (err) {
      console.error(err)
      toast({ title: "任务添加失败", status: "error", duration: 1000 })
    }
  }

  // === 🔮 新增：AI 智能分析函数 ===
  const handleAiAnalyze = async () => {
    if (!aiPrompt) {
      toast({ title: "请先输入一句话", status: "warning" })
      return
    }
    
    try {
      const data = await analyzeTask()
      toast({ 
        title: "AI 识别成功！", 
        description: `优先级: ${data.priority === 3 ? '紧急 🔥' : '普通'}`,
        status: "success",
        position: "top",
        duration: 2000 
      })
    } catch (error) {
      console.error(error)
      toast({ title: "AI 分析失败", status: "error", duration: 1500 })
    }
  }

  const handleLogout = () => {
    clearToken()
    toast({ title: "已退出登录", position: "top" })
  }

  if (!token) return <Login />

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
          
          {/* 欢迎语和头像 */}
          <VStack spacing={6} align="center">
            {/* 头像上传 */}
            <AvatarUpload />
            {/* 欢迎语 */}
            <Box textAlign="center">
              <Heading size="lg">今天做什么？</Heading>
              <Text color="gray.500">保持专注，逐个击破。</Text>
            </Box>
          </VStack>

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
            newTaskCategory={newTaskCategory}
            setNewTaskCategory={setNewTaskCategory}
            handleSubmit={handleSubmit} 
          />

          {/* 标签页：任务列表和仪表盘 */}
          <Tabs isFitted variant="enclosed">
            <TabList>
              <Tab fontWeight="medium">📋 任务列表</Tab>
              <Tab fontWeight="medium">📊 数据统计</Tab>
            </TabList>
            <TabPanels>
              {/* 任务列表 */}
              <TabPanel padding={0}>
                {/* 筛选器 */}
                <Box mb={4}>
                  <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>分类筛选</Text>
                  <HStack spacing={2} overflowX="auto" pb={2}>
                    {[
                      { value: '全部', label: '全部' },
                      { value: '日常', label: '日常' },
                      { value: '购物', label: '购物' },
                      { value: '学习', label: '学习' },
                      { value: '工作', label: '工作' },
                      { value: '其他', label: '其他' }
                    ].map((item) => (
                      <Button
                        key={item.value}
                        size="sm"
                        variant={filterCategory === item.value ? "solid" : "ghost"}
                        colorScheme={filterCategory === item.value ? "purple" : "gray"}
                        onClick={() => setFilterCategory(item.value)}
                        borderRadius="full"
                        flexShrink={0}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </HStack>
                </Box>
                
                {/* 任务列表 */}
                <TaskList 
                  tasks={tasks} 
                  filterCategory={filterCategory}
                  toggleTask={toggleTask} 
                  deleteTask={deleteTask} 
                  editTask={editTask}
                />
              </TabPanel>
              {/* 仪表盘 */}
              <TabPanel padding={0}>
                <Dashboard />
              </TabPanel>
            </TabPanels>
          </Tabs>
          
        </VStack>
      </Container>
    </Box>
  )
}

export default App