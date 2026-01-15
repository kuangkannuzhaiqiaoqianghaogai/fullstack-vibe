// src/components/TaskList.jsx
import React, { useState } from 'react'
import { 
  VStack, HStack, Text, IconButton, Badge, Spacer, Box, Checkbox, 
  Input, Button, Flex
} from '@chakra-ui/react'
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'

// 🎨 定义一个调色盘，给不同的分类分配颜色
const getBadgeColor = (category) => {
  if (category.includes('购物')) return 'pink'
  if (category.includes('学习')) return 'cyan'
  if (category.includes('运动')) return 'orange'
  return 'gray' // 默认颜色
}

// 🎨 定义优先级颜色和标签
const getPriorityInfo = (priority) => {
  switch (priority) {
    case 1:
      return { color: 'green', label: '低' }
    case 2:
      return { color: 'yellow', label: '中' }
    case 3:
      return { color: 'red', label: '高' }
    default:
      return { color: 'gray', label: '低' }
  }
}

// 格式化截止日期
const formatDeadline = (deadline) => {
  if (!deadline) return ''
  
  const date = new Date(deadline)
  const now = new Date()
  const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24))
  
  let status = ''
  if (diffDays < 0) {
    status = '⚠️ 已过期'
  } else if (diffDays === 0) {
    status = '⏰ 今天'
  } else if (diffDays === 1) {
    status = '⏰ 明天'
  } else if (diffDays < 7) {
    status = `⏰ ${diffDays}天后`
  }
  
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()} ${status}`
}

const TaskList = React.memo(({ tasks, filterCategory, filterPriority, filterDeadline, toggleTask, deleteTask, editTask }) => {
  // 编辑状态：当前正在编辑的任务ID和编辑内容
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  
  // 开始编辑任务
  const handleEditStart = (task) => {
    setEditingTaskId(task.id)
    setEditingContent(task.content)
  }
  
  // 取消编辑
  const handleEditCancel = () => {
    setEditingTaskId(null)
    setEditingContent('')
  }
  
  // 保存编辑
  const handleEditSave = (taskId) => {
    if (editingContent.trim()) {
      editTask(taskId, editingContent.trim())
      setEditingTaskId(null)
      setEditingContent('')
    }
  }
  
  // 任务筛选逻辑：支持按分类、优先级和截止日期筛选
  const filteredTasks = tasks.filter(task => {
    // 分类筛选
    const matchesCategory = filterCategory === '全部' || task.category === filterCategory
    // 优先级筛选
    const matchesPriority = filterPriority === '全部' || task.priority === parseInt(filterPriority)
    // 截止日期筛选
    let matchesDeadline = true
    if (filterDeadline !== '全部' && task.deadline) {
      const deadline = new Date(task.deadline)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextWeek = new Date(today)
      nextWeek.setDate(nextWeek.getDate() + 7)
      const nextMonth = new Date(today)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      
      switch (filterDeadline) {
        case '今天':
          matchesDeadline = deadline >= today && deadline < tomorrow
          break
        case '明天':
          matchesDeadline = deadline >= tomorrow && deadline < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          break
        case '本周':
          matchesDeadline = deadline >= today && deadline < nextWeek
          break
        case '本月':
          matchesDeadline = deadline >= today && deadline < nextMonth
          break
        default:
          matchesDeadline = true
      }
    } else if (filterDeadline !== '全部' && !task.deadline) {
      matchesDeadline = false
    }
    
    return matchesCategory && matchesPriority && matchesDeadline
  })
  
  if (filteredTasks.length === 0) {
    return (
      <Box textAlign="center" py={10} color="gray.400">
        <Text fontSize="lg">
          📭 {tasks.length > 0 ? `没有符合条件的任务` : '还没有任务，添加一个试试？'}
        </Text>
      </Box>
    )
  }

  return (
    <VStack spacing={3} align="stretch" w="100%">
      {filteredTasks.map(task => (
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

            {/* 2. 任务内容或编辑表单 */}
            {editingTaskId === task.id ? (
              <Flex flex={1} gap={2} alignItems="center">
                <Input
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  variant="filled"
                  size="sm"
                  bg="gray.50"
                  focusBorderColor="purple.500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(task.id)
                    if (e.key === 'Escape') handleEditCancel()
                  }}
                />
                <Button
                  size="xs"
                  colorScheme="green"
                  leftIcon={<FaSave />}
                  onClick={() => handleEditSave(task.id)}
                  isDisabled={!editingContent.trim()}
                >
                  保存
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  leftIcon={<FaTimes />}
                  onClick={handleEditCancel}
                >
                  取消
                </Button>
              </Flex>
            ) : (
              <Text 
                flex={1} // 占据剩余空间
                as={task.is_done ? 's' : 'span'} // 如果完成了，加删除线(s标签)
                color={task.is_done ? 'gray.400' : 'gray.800'}
                fontWeight={task.is_done ? 'normal' : 'medium'}
              >
                {task.content}
              </Text>
            )}

            {/* 3. 优先级标签 */}
            {getPriorityInfo(task.priority) && (
              <Badge 
                colorScheme={getPriorityInfo(task.priority).color} 
                variant="solid" 
                borderRadius="full" 
                px={2}
                fontWeight="bold"
                fontSize="xs"
              >
                {getPriorityInfo(task.priority).label}
              </Badge>
            )}
            
            {/* 4. 分类标签 */}
            <Badge colorScheme={getBadgeColor(task.category)} variant="subtle" borderRadius="full" px={2}>
              {task.category}
            </Badge>
            
            {/* 5. 截止日期标签 */}
            {task.deadline && (
              <Badge 
                colorScheme={new Date(task.deadline) < new Date() ? "red" : "blue"} 
                variant="subtle" 
                borderRadius="full" 
                px={2}
                fontSize="xs"
              >
                {formatDeadline(task.deadline)}
              </Badge>
            )}

            {/* 6. 操作按钮 */}
            <HStack spacing={1}>
              {/* 编辑按钮 */}
              <IconButton 
                icon={<FaEdit />}
                colorScheme="blue"
                variant="ghost"
                size="sm"
                onClick={() => handleEditStart(task)}
                aria-label="编辑任务"
              />
              
              {/* 删除按钮 (红色垃圾桶) */}
              <IconButton 
                icon={<FaTrash />}
                colorScheme="red"
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                aria-label="删除任务"
              />
            </HStack>
          </HStack>
        </Box>
      ))}
    </VStack>
  )
})

export default TaskList