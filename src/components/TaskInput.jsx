// src/components/TaskInput.jsx
import React from 'react'
import { HStack, Input, Button } from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa' // 引入加号图标

function TaskInput({ newTask, setNewTask, handleSubmit }) {
  return (
    <HStack as="form" onSubmit={handleSubmit} w="100%">
      <Input 
        placeholder="💡 比如：去超市买牛奶..." 
        value={newTask} 
        onChange={(e) => setNewTask(e.target.value)}
        variant="filled" // 填充风格，带点灰色背景
        bg="white"
        size="lg"        // 大一点，看着舒服
        borderRadius="full" // 圆角设计
        focusBorderColor="purple.500" // 聚焦时变紫
        boxShadow="sm"
      />
      <Button 
        type="submit" 
        colorScheme="purple" 
        size="lg" 
        borderRadius="full"
        px={8} // 左右加宽一点
        leftIcon={<FaPlus />} // 按钮上带个加号
        boxShadow="md"
        isDisabled={!newTask.trim()} // 没写字时按钮变灰，防止误触
      >
        添加
      </Button>
    </HStack>
  )
}

export default TaskInput