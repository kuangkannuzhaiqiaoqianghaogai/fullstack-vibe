// src/components/ThemeToggle.jsx
// 主题切换组件，支持深色/浅色模式
import React from 'react'
import { Switch, HStack, Text, useColorMode } from '@chakra-ui/react'
import { FaSun, FaMoon } from 'react-icons/fa'
import useStore from '../store'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useStore()
  const { colorMode, setColorMode } = useColorMode()

  // 切换主题时同步更新 Chakra UI 的 colorMode
  const handleToggle = () => {
    toggleTheme()
    setColorMode(isDarkMode ? 'light' : 'dark')
  }

  return (
    <HStack spacing={2} alignItems="center">
      <FaSun size={16} color={isDarkMode ? '#94a3b8' : '#fbbf24'} />
      <Switch
        isChecked={isDarkMode}
        onChange={handleToggle}
        colorScheme="purple"
      />
      <FaMoon size={16} color={isDarkMode ? '#3b82f6' : '#64748b'} />
    </HStack>
  )
}

export default ThemeToggle