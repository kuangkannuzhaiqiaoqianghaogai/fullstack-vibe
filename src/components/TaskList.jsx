// src/components/TaskList.jsx
import React, { useState } from 'react'
import {
  VStack, HStack, Text, IconButton, Badge, Spacer, Box, Checkbox,
  Input, Button, Flex, Select, useColorMode
} from '@chakra-ui/react'
import { FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

// 可拖拽的任务项组件
const SortableItem = React.memo(({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: id.toString() })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
    userSelect: 'none',
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  )
})

const TaskList = React.memo(({ tasks, filterCategory, filterPriority, filterDeadline, toggleTask, deleteTask, editTask, updateTasksSort }) => {
  // 编辑状态：当前正在编辑的任务
  const [editingTask, setEditingTask] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [editingPriority, setEditingPriority] = useState(1)
  const [editingCategory, setEditingCategory] = useState('日常')
  
  // 获取当前主题模式
  const { colorMode } = useColorMode()
  
  // 传感器配置，用于检测拖拽事件
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 拖动距离超过8px才触发拖拽
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // 开始编辑任务
  const handleEditStart = (task) => {
    setEditingTask(task)
    setEditingContent(task.content)
    setEditingPriority(task.priority || 1)
    setEditingCategory(task.category || '日常')
  }
  
  // 取消编辑
  const handleEditCancel = () => {
    setEditingTask(null)
    setEditingContent('')
    setEditingPriority(1)
    setEditingCategory('日常')
  }
  
  // 保存编辑
  const handleEditSave = () => {
    if (!editingTask || !editingContent.trim()) return
    
    // 调用editTask更新任务，传递所有需要更新的字段
    editTask(editingTask.id, {
      content: editingContent.trim(),
      priority: editingPriority,
      category: editingCategory
    })
    
    // 重置编辑状态
    handleEditCancel()
  }
  
  // 拖拽结束事件处理
  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex((task) => task.id.toString() === active.id)
      const newIndex = filteredTasks.findIndex((task) => task.id.toString() === over.id)
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // 重新排列任务
        const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex)
        
        // 准备批量更新的数据
        const tasksData = reorderedTasks.map((task, index) => ({
          id: task.id,
          sort_order: index
        }))
        
        // 调用批量更新排序的方法
        updateTasksSort(tasksData)
      }
    }
  }
  
  // 任务筛选逻辑：支持按分类、优先级和截止日期筛选
  const filteredTasks = tasks.filter(task => {
    // 分类筛选 - 修复：确保分类匹配逻辑正确
    let matchesCategory = true
    if (filterCategory === '全部') {
      matchesCategory = true
    } else {
      // 支持精确匹配和包含匹配
      matchesCategory = task.category === filterCategory || 
                       (task.category && task.category.includes(filterCategory))
    }
    
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
  
  // 生成任务ID数组，用于拖拽排序
  const taskIds = filteredTasks.map((task) => task.id.toString())
  
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={taskIds}
        strategy={verticalListSortingStrategy}
      >
        <VStack spacing={3} align="stretch" w="100%">
          {filteredTasks.map(task => (
            <SortableItem key={task.id} id={task.id}>
              <Box 
                p={4} 
                bg={colorMode === 'dark' ? 'gray.800' : 'white'} 
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
                  {editingTask && editingTask.id === task.id ? (
                    <Flex flex={1} gap={2} alignItems="center" flexWrap="wrap">
                      {/* 内容输入 */}
                      <Input
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        variant="filled"
                        size="sm"
                        bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                        color={colorMode === 'dark' ? 'white' : 'gray.800'}
                        focusBorderColor="purple.500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave()
                          if (e.key === 'Escape') handleEditCancel()
                        }}
                        flex={1}
                        minW="150px"
                      />
                      
                      {/* 优先级选择 */}
                      <Select
                        value={editingPriority}
                        onChange={(e) => setEditingPriority(parseInt(e.target.value))}
                        size="sm"
                        variant="filled"
                        bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                        color={colorMode === 'dark' ? 'white' : 'gray.800'}
                        focusBorderColor="purple.500"
                        width="100px"
                      >
                        <option value={1}>低</option>
                        <option value={2}>中</option>
                        <option value={3}>高</option>
                      </Select>
                      
                      {/* 分类选择 */}
                      <Select
                        value={editingCategory}
                        onChange={(e) => setEditingCategory(e.target.value)}
                        size="sm"
                        variant="filled"
                        bg={colorMode === 'dark' ? 'gray.700' : 'gray.50'}
                        color={colorMode === 'dark' ? 'white' : 'gray.800'}
                        focusBorderColor="purple.500"
                        width="120px"
                      >
                        <option value="日常">日常</option>
                        <option value="购物">购物</option>
                        <option value="学习">学习</option>
                        <option value="工作">工作</option>
                        <option value="其他">其他</option>
                      </Select>
                      
                      {/* 保存按钮 */}
                      <Button
                        size="xs"
                        colorScheme="green"
                        leftIcon={<FaSave />}
                        onClick={handleEditSave}
                        isDisabled={!editingContent.trim()}
                      >
                        保存
                      </Button>
                      
                      {/* 取消按钮 */}
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
                      color={task.is_done ? 'gray.400' : (colorMode === 'dark' ? 'white' : 'gray.800')}
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
            </SortableItem>
          ))}
        </VStack>
      </SortableContext>
    </DndContext>
  )
})

export default TaskList