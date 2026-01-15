// src/components/TaskExportImport.jsx
// 任务导出/导入组件
import React, { useState } from 'react'
import {
  Box, Button, VStack, HStack, Text,
  Input, InputGroup, InputRightElement,
  IconButton, Alert, AlertIcon, useToast
} from '@chakra-ui/react'
import { FaDownload, FaUpload, FaTimes } from 'react-icons/fa'
import useStore from '../store'

const TaskExportImport = () => {
  const { exportTasks, importTasks } = useStore()
  const toast = useToast()
  const [file, setFile] = useState(null)

  // 处理导出任务
  const handleExportTasks = async () => {
    try {
      await exportTasks()
      toast({
        title: '任务导出成功',
        description: '任务数据已成功导出为JSON文件',
        status: 'success',
        duration: 2000,
        position: 'top'
      })
    } catch (error) {
      toast({
        title: '任务导出失败',
        description: '导出任务时发生错误，请稍后重试',
        status: 'error',
        duration: 2000,
        position: 'top'
      })
    }
  }

  // 处理文件选择
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // 检查文件类型
      if (selectedFile.type === 'application/json') {
        setFile(selectedFile)
      } else {
        toast({
          title: '无效的文件类型',
          description: '请选择JSON格式的文件',
          status: 'warning',
          duration: 2000,
          position: 'top'
        })
      }
    }
  }

  // 清除选中的文件
  const handleClearFile = () => {
    setFile(null)
    // 清空文件输入
    const input = document.getElementById('task-import-file')
    if (input) {
      input.value = ''
    }
  }

  // 处理导入任务
  const handleImportTasks = async () => {
    if (!file) {
      toast({
        title: '请选择文件',
        description: '请先选择要导入的JSON文件',
        status: 'warning',
        duration: 2000,
        position: 'top'
      })
      return
    }

    try {
      // 读取文件内容
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const importData = JSON.parse(e.target.result)
          // 验证数据格式
          if (!importData.tasks || !Array.isArray(importData.tasks)) {
            throw new Error('无效的数据格式')
          }
          // 调用导入方法
          const result = await importTasks(importData.tasks)
          toast({
            title: '任务导入成功',
            description: result.message || `成功导入 ${importData.tasks.length} 个任务`,
            status: 'success',
            duration: 2000,
            position: 'top'
          })
          // 清空文件选择
          handleClearFile()
        } catch (error) {
          toast({
            title: '导入失败',
            description: '文件格式错误或数据无效',
            status: 'error',
            duration: 2000,
            position: 'top'
          })
        }
      }
      reader.readAsText(file)
    } catch (error) {
      toast({
        title: '导入失败',
        description: '导入任务时发生错误，请稍后重试',
        status: 'error',
        duration: 2000,
        position: 'top'
      })
    }
  }

  return (
    <Box
      p={4}
      bg="purple.50"
      borderRadius="lg"
      border="1px solid"
      borderColor="purple.100"
    >
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" color="purple.800">
            📤 任务导出/导入
          </Text>
        </HStack>

        <Alert status="info" variant="subtle" flexDirection="column" alignItems="flex-start">
          <AlertIcon />
          <Text fontSize="sm">
            导出功能将把您的所有任务保存为JSON文件，导入功能将从JSON文件中恢复任务。
          </Text>
        </Alert>

        <VStack spacing={3} align="stretch">
          {/* 导出按钮 */}
          <Button
            leftIcon={<FaDownload />}
            colorScheme="purple"
            onClick={handleExportTasks}
            variant="solid"
            size="lg"
          >
            导出任务
          </Button>

          {/* 导入区域 */}
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
              导入任务
            </Text>
            <InputGroup>
              <Input
                type="file"
                id="task-import-file"
                onChange={handleFileChange}
                accept=".json"
                display="none"
              />
              <Input
                placeholder="选择JSON文件..."
                value={file ? file.name : ''}
                isReadOnly
                bg="white"
                borderRadius="md"
                focusBorderColor="purple.500"
              />
              <InputRightElement width="auto" display="flex">
                {file && (
                  <IconButton
                    size="sm"
                    icon={<FaTimes />}
                    onClick={handleClearFile}
                    variant="ghost"
                    colorScheme="gray"
                    mr={1}
                  />
                )}
                <IconButton
                  as="label"
                  htmlFor="task-import-file"
                  size="sm"
                  icon={<FaUpload />}
                  colorScheme="purple"
                >
                  浏览
                </IconButton>
              </InputRightElement>
            </InputGroup>
            {file && (
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  size="sm"
                  colorScheme="green"
                  leftIcon={<FaUpload />}
                  onClick={handleImportTasks}
                >
                  开始导入
                </Button>
              </Box>
            )}
          </Box>
        </VStack>
      </VStack>
    </Box>
  )
}

export default TaskExportImport