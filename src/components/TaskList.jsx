// src/components/TaskList.jsx
import React from 'react'
import { 
  VStack, HStack, Text, IconButton, Badge, Spacer, Box, Checkbox 
} from '@chakra-ui/react'
import { FaTrash } from 'react-icons/fa'

// 🎨 定义一个调色盘，给不同的分类分配颜色
const getBadgeColor = (category) => {
  if (category.includes('购物')) return 'pink'
  if (category.includes('学习')) return 'cyan'
  if (category.includes('运动')) return 'orange'
  return 'gray' // 默认颜色
}

function TaskList({ tasks, toggleTask, deleteTask }) {
  
  if (tasks.length === 0) {
    return (
      <Box textAlign="center" py={10} color="gray.400">
        <Text fontSize="lg">📭 还没有任务，添加一个试试？</Text>
      </Box>
    )
  }

  return (
    <VStack spacing={3} align="stretch" w="100%">
      {tasks.map(task => (
        <Box 
          key={task.id} 
          p={4} 
          bg="white" 
          borderRadius="lg" 
          boxShadow="sm"
          borderLeft="4px solid"
          borderLeftColor={task.is_done ? "green.400" : "purple.400"} // 完成变绿，未完成紫
          transition="all 0.2s"
          _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }} // 鼠标悬停微微上浮
        >
          <HStack>
            {/* 1. 复选框 */}
            <Checkbox 
              isChecked={task.is_done} 
              onChange={() => toggleTask(task.id, task.is_done)}
              colorScheme="green"
              size="lg"
            />

            {/* 2. 任务内容 */}
            <Text 
              flex={1} // 占据剩余空间
              as={task.is_done ? 's' : 'span'} // 如果完成了，加删除线(s标签)
              color={task.is_done ? 'gray.400' : 'gray.800'}
              fontWeight={task.is_done ? 'normal' : 'medium'}
            >
              {task.content}
            </Text>

            {/* 3. 分类标签 */}
            <Badge colorScheme={getBadgeColor(task.category)} variant="subtle" borderRadius="full" px={2}>
              {task.category}
            </Badge>

            {/* 4. 删除按钮 (红色垃圾桶) */}
            <IconButton 
              icon={<FaTrash />}
              colorScheme="red"
              variant="ghost" // 幽灵模式（透明背景）
              size="sm"
              onClick={() => deleteTask(task.id)}
              aria-label="删除任务"
            />
          </HStack>
        </Box>
      ))}
    </VStack>
  )
}

export default TaskList