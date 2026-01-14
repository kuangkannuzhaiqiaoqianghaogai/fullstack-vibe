// src/components/AvatarUpload.jsx
// 头像上传组件
import React, { useState, useRef, useEffect } from 'react'
import { 
  Box, Button, Avatar, Input, VStack, Text, 
  useToast, CircularProgress, Tooltip
} from '@chakra-ui/react'
import { FaUpload, FaCamera } from 'react-icons/fa'
import useStore from '../store'

function AvatarUpload() {
  const { avatar_url, uploadAvatar, username, fetchCurrentUser } = useStore()
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(avatar_url)
  const fileInputRef = useRef(null)
  const toast = useToast()

  // 当avatar_url变化时，更新预览
  useEffect(() => {
    setPreview(avatar_url)
  }, [avatar_url])

  // 选择文件后的处理
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "只能上传图片文件", 
          status: "error", 
          duration: 1500 
        })
        return
      }

      // 检查文件大小（限制10MB）
      if (file.size > 10 * 1024 * 1024) {
        toast({ 
          title: "图片大小不能超过10MB", 
          status: "error", 
          duration: 1500 
        })
        return
      }

      // 生成预览
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result)
      }
      reader.readAsDataURL(file)

      // 上传文件
      handleUpload(file)
    }
  }

  // 处理文件上传
  const handleUpload = async (file) => {
    setIsUploading(true)
    try {
      await uploadAvatar(file)
      toast({ 
        title: "头像上传成功", 
        status: "success", 
        duration: 1500 
      })
    } catch (error) {
      toast({ 
        title: "头像上传失败", 
        status: "error", 
        duration: 1500 
      })
      console.error('上传失败:', error)
    } finally {
      setIsUploading(false)
    }
  }

  // 触发文件选择
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  return (
    <Box textAlign="center">
      <VStack spacing={3} align="center">
        {/* 头像预览 */}
        <Box position="relative" cursor="pointer" onClick={triggerFileInput}>
          <Avatar
            size="2xl"
            name={username || "用户"}
            src={preview || undefined}
            bg="purple.400"
            _hover={{ opacity: 0.8 }}
          >
            {isUploading && (
              <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
              >
                <CircularProgress size="24px" isIndeterminate color="white" />
              </Box>
            )}
            {/* 上传图标 */}
            <Tooltip label="更换头像" placement="bottom">
              <Box
                position="absolute"
                bottom="0"
                right="0"
                bg="purple.500"
                p={1.5}
                borderRadius="full"
                border="2px solid white"
                boxShadow="md"
              >
                <FaCamera color="white" size="16px" />
              </Box>
            </Tooltip>
          </Avatar>
        </Box>

        {/* 用户名 */}
        <Text fontWeight="medium" fontSize="lg" color="gray.700">
          {username || "用户"}
        </Text>

        {/* 隐藏的文件输入 */}
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          display="none"
        />

        {/* 上传按钮 */}
        <Button
          colorScheme="purple"
          leftIcon={<FaUpload />}
          onClick={triggerFileInput}
          isLoading={isUploading}
          size="sm"
          variant="outline"
        >
          {isUploading ? "上传中..." : "更换头像"}
        </Button>
      </VStack>
    </Box>
  )
}

export default AvatarUpload
