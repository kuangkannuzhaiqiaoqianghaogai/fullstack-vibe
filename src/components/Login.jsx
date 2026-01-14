// src/components/Login.jsx
import React, { useState } from 'react'
import { API_URL } from '../config'
// 👇 引入漂亮的组件
import { 
  Box, Button, Input, VStack, Heading, Text, 
  useToast, Container, InputGroup, InputLeftElement 
} from '@chakra-ui/react'
// 👇 引入图标
import { FaUser, FaLock } from 'react-icons/fa'
// 👇 引入 API 封装
import { auth } from '../api'

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // 加载状态

  const toast = useToast() // 召唤提示框

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true) // 按钮开始转圈圈

    try {
      if (isRegistering) {
        // 注册：使用 API 封装
        await auth.register({ username, password })
        // 注册成功
        toast({
          title: "注册成功 🎉",
          description: "请使用新账号登录",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top"
        })
        setIsRegistering(false)
        setPassword('')
      } else {
        // 登录：使用 API 封装
        const data = await auth.login({ username, password })
        // 登录成功
        localStorage.setItem('vibe_token', data.access_token)
        toast({
          title: "欢迎回来 👋",
          status: "success",
          duration: 2000,
          position: "top"
        })
        onLoginSuccess()
      }

    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || '操作失败'
      toast({
        title: "出错了",
        description: errorMsg,
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      })
    } finally {
      setIsLoading(false) // 停止转圈
    }
  }

  return (
    <Box 
      h="100vh" 
      bgGradient="linear(to-r, blue.400, purple.500)" // 漂亮的渐变背景
      display="flex" 
      alignItems="center" 
      justifyContent="center"
    >
      <Container maxW="sm">
        <Box 
          p={8} 
          bg="white" 
          borderRadius="xl" 
          boxShadow="2xl" // 深邃的阴影
        >
          <VStack spacing={6} as="form" onSubmit={handleSubmit}>
            <Heading size="lg" color="gray.700">
              {isRegistering ? '加入我们 🚀' : 'Vibe Coding'}
            </Heading>
            
            <InputGroup>
              <InputLeftElement pointerEvents='none' children={<FaUser color='gray.300' />} />
              <Input 
                placeholder="用户名" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                variant="filled"
              />
            </InputGroup>

            <InputGroup>
              <InputLeftElement pointerEvents='none' children={<FaLock color='gray.300' />} />
              <Input 
                type="password" 
                placeholder="密码" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                variant="filled"
              />
            </InputGroup>

            <Button 
              type="submit" 
              colorScheme={isRegistering ? "blue" : "purple"} // 注册蓝，登录紫
              width="full"
              isLoading={isLoading} // 自动处理加载动画
              loadingText="提交中..."
            >
              {isRegistering ? '立即注册' : '登录'}
            </Button>

            <Text fontSize="sm" color="gray.500">
              {isRegistering ? '已有账号？' : '还没有账号？'}
              <Text 
                as="span" 
                color="purple.500" 
                cursor="pointer" 
                fontWeight="bold"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? ' 去登录' : ' 去注册'}
              </Text>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default Login