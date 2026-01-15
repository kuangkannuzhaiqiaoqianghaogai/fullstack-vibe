// src/components/TaskInput.jsx
import React from 'react'
import { HStack, Input, Button, Select, Box } from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa' // 引入加号图标

const TaskInput = React.memo(({ 
  newTask, 
  setNewTask, 
  handleSubmit, 
  newTaskCategory, 
  setNewTaskCategory,
  newTaskPriority,
  setNewTaskPriority,
  newTaskDeadline,
  setNewTaskDeadline
}) => {
  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      {/* 分类和优先级选择 */}
      <Box mb={3}>
        <HStack gap={4} mb={3}>
          <Select
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
            bg="white"
            borderRadius="md"
            focusBorderColor="purple.500"
            boxShadow="sm"
            flex={1}
            maxW="200px"
            placeholder="选择分类"
          >
            <option value="日常">日常</option>
            <option value="购物">购物</option>
            <option value="学习">学习</option>
            <option value="工作">工作</option>
            <option value="其他">其他</option>
          </Select>
          
          <Select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(parseInt(e.target.value))}
            bg="white"
            borderRadius="md"
            focusBorderColor="purple.500"
            boxShadow="sm"
            flex={1}
            maxW="200px"
            placeholder="选择优先级"
          >
            <option value={1}>低优先级</option>
            <option value={2}>中优先级</option>
            <option value={3}>高优先级</option>
          </Select>
        </HStack>
        
        {/* 截止日期选择 */}
        <HStack gap={4}>
          <Input
            type="datetime-local"
            value={newTaskDeadline ? new Date(newTaskDeadline).toISOString().slice(0, 16) : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value) : null
              setNewTaskDeadline(date)
            }}
            bg="white"
            borderRadius="md"
            focusBorderColor="purple.500"
            boxShadow="sm"
            flex={1}
            placeholder="选择截止日期"
          />
          
          {/* 清除截止日期按钮 */}
          {newTaskDeadline && (
            <Button
              size="sm"
              variant="ghost"
              colorScheme="gray"
              onClick={() => setNewTaskDeadline(null)}
            >
              清除
            </Button>
          )}
        </HStack>
      </Box>
      
      {/* 任务输入和添加按钮 */}
      <HStack w="100%">
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
    </Box>
  )
})

export default TaskInput