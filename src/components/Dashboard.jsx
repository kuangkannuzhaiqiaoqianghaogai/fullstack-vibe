// src/components/Dashboard.jsx
// 数据可视化仪表盘
import React from 'react'
import { 
  Box, VStack, HStack, Text, Heading, Card, CardBody, 
  CardHeader, Stat, StatLabel, StatNumber, StatHelpText,
  Grid, GridItem 
} from '@chakra-ui/react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import useStore from '../store'

// 定义颜色常量
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE']

function Dashboard() {
  const { tasks } = useStore()
  
  // 统计任务数据
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.is_done).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // 按分类统计任务
  const categoryStats = tasks.reduce((acc, task) => {
    const category = task.category || '其他'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})
  
  // 转换为饼图数据格式
  const pieData = Object.entries(categoryStats).map(([name, value]) => ({
    name,
    value
  }))
  
  // 按完成状态统计
  const statusData = [
    { name: '已完成', value: completedTasks },
    { name: '未完成', value: pendingTasks }
  ]
  
  // 固定的模拟数据，避免使用Math.random()
  const efficiencyData = [
    { day: '周一', completed: 3 },
    { day: '周二', completed: 5 },
    { day: '周三', completed: 2 },
    { day: '周四', completed: 4 },
    { day: '周五', completed: 1 },
    { day: '周六', completed: 5 },
    { day: '周日', completed: 3 }
  ]
  
  return (
    <Box>
      <Heading size="lg" mb={6} color="purple.600">📊 任务统计</Heading>
      
      {/* 统计卡片 */}
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} mb={6}>
        <GridItem>
          <Card shadow="sm" borderLeft="4px solid" borderLeftColor="purple.500">
            <CardBody>
              <Stat>
                <StatLabel>总任务数</StatLabel>
                <StatNumber>{totalTasks}</StatNumber>
                <StatHelpText>所有创建的任务</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card shadow="sm" borderLeft="4px solid" borderLeftColor="green.500">
            <CardBody>
              <Stat>
                <StatLabel>已完成</StatLabel>
                <StatNumber>{completedTasks}</StatNumber>
                <StatHelpText>已完成的任务</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card shadow="sm" borderLeft="4px solid" borderLeftColor="orange.500">
            <CardBody>
              <Stat>
                <StatLabel>未完成</StatLabel>
                <StatNumber>{pendingTasks}</StatNumber>
                <StatHelpText>待完成的任务</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
        
        <GridItem>
          <Card shadow="sm" borderLeft="4px solid" borderLeftColor="blue.500">
            <CardBody>
              <Stat>
                <StatLabel>完成率</StatLabel>
                <StatNumber>{completionRate}%</StatNumber>
                <StatHelpText>任务完成比例</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      {/* 图表区域 */}
      <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6} mb={6}>
        {/* 任务分类饼图 */}
        <GridItem>
          <Card shadow="sm">
            <CardHeader>
              <Heading size="md">任务分类</Heading>
            </CardHeader>
            <CardBody>
              <Box h={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
        
        {/* 任务状态饼图 */}
        <GridItem>
          <Card shadow="sm">
            <CardHeader>
              <Heading size="md">任务状态</Heading>
            </CardHeader>
            <CardBody>
              <Box h={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      <Cell fill="#82ca9d" />
                      <Cell fill="#ffc658" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
      
      {/* 效率曲线柱状图 */}
      <Card shadow="sm" mb={6}>
        <CardHeader>
          <Heading size="md">一周效率曲线</Heading>
        </CardHeader>
        <CardBody>
          <Box h={300}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={efficiencyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completed" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>
      
      {/* AI 分析建议 */}
      <Card shadow="sm" bg="purple.50" border="1px solid" borderColor="purple.100">
        <CardHeader>
          <Heading size="md" color="purple.700">🧠 AI 分析建议</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={2} align="stretch">
            <Text color="gray.700">
              • 你的任务完成率为 <strong>{completionRate}%</strong>，继续保持！
            </Text>
            <Text color="gray.700">
              • 本周平均每天完成 <strong>{Math.round(efficiencyData.reduce((sum, day) => sum + day.completed, 0) / 7)}</strong> 个任务
            </Text>
            <Text color="gray.700">
              • {pendingTasks > completedTasks ? '建议优先完成未完成的任务' : '继续保持高效的工作状态'}
            </Text>
            <Text color="gray.700">
              • 可以尝试将大任务拆分为小任务，提高完成率
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  )
}

export default Dashboard
