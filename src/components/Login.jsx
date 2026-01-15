// src/components/Login.jsx
import React, { useState } from 'react'
import { API_URL } from '../config'
// 👇 引入漂亮的组件
import {
  Box, Button, Input, VStack, Heading, Text,
  useToast, Container, InputGroup, InputLeftElement,
  ColorModeProvider, CSSReset, useColorMode
} from '@chakra-ui/react'
// 👇 引入图标
import { FaUser, FaLock } from 'react-icons/fa'
// 👇 引入 API 封装
import { auth } from '../api'
// 👇 引入 Zustand store
import useStore from '../store'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isLoading, setIsLoading] = useState(false) // 加载状态

  const toast = useToast() // 召唤提示框
  const { setToken, isDarkMode } = useStore() // 使用 Zustand store
  const { colorMode, setColorMode } = useColorMode()

  // 初始化主题
  React.useEffect(() => {
    setColorMode(isDarkMode ? 'dark' : 'light')
  }, [isDarkMode, setColorMode])

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
        setToken(data.access_token) // 使用 Zustand store 设置 token
        toast({
          title: "欢迎回来 👋",
          status: "success",
          duration: 2000,
          position: "top"
        })
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
    <ColorModeProvider>
      <CSSReset />
      <Box
        h="100vh"
        bg={colorMode === 'dark' ? 'gray.900' : 'linear(to-r, blue.400, purple.500)'}
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <Container maxW="sm">
          <Box
            p={8}
            bg={colorMode === 'dark' ? 'gray.800' : 'white'}
            borderRadius="xl"
            boxShadow="2xl"
            border={colorMode === 'dark' ? '1px solid gray.700' : 'none'}
          >
            <VStack spacing={6} as="form" onSubmit={handleSubmit}>
              <Heading size="lg" color={colorMode === 'dark' ? 'white' : 'gray.700'}>
                {isRegistering ? '加入我们 🚀' : 'Vibe Coding'}
              </Heading>
              
              <InputGroup>
                <InputLeftElement pointerEvents='none' children={<FaUser color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />} />
                <Input
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="filled"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                  color={colorMode === 'dark' ? 'white' : 'gray.800'}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                />
              </InputGroup>

              <InputGroup>
                <InputLeftElement pointerEvents='none' children={<FaLock color={colorMode === 'dark' ? 'gray.400' : 'gray.300'} />} />
                <Input
                  type="password"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="filled"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                  color={colorMode === 'dark' ? 'white' : 'gray.800'}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                />
              </InputGroup>

              <Button
                type="submit"
                colorScheme={isRegistering ? "blue" : "purple"}
                width="full"
                isLoading={isLoading}
                loadingText="提交中..."
              >
                {isRegistering ? '立即注册' : '登录'}
              </Button>

              <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.300' : 'gray.500'}>
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
    </ColorModeProvider>
  )
}

export default Login