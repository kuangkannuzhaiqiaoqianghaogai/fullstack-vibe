// src/components/SearchBar.jsx
// 任务搜索组件
import React from 'react'
import {
  InputGroup, Input, InputLeftElement,
  InputRightElement, IconButton, Box, useColorMode
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { FaTimes } from 'react-icons/fa'
import useStore from '../store'

const SearchBar = () => {
  const { searchQuery, setSearchQuery } = useStore()

  // 清除搜索内容
  const handleClearSearch = () => {
    setSearchQuery('')
  }

  return (
    <Box mb={4} w="100%">
      <InputGroup size="md">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.400" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="🔍 搜索任务..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          borderRadius="full"
          focusBorderColor="purple.500"
          bg={useColorMode().colorMode === 'dark' ? 'gray.800' : 'white'}
          color={useColorMode().colorMode === 'dark' ? 'white' : 'gray.800'}
          _placeholder={{ color: 'gray.500' }}
        />
        {searchQuery && (
          <InputRightElement width="4.5rem">
            <IconButton
              h="1.75rem"
              size="sm"
              onClick={handleClearSearch}
              icon={<FaTimes />}
              variant="ghost"
              colorScheme="gray"
            />
          </InputRightElement>
        )}
      </InputGroup>
    </Box>
  )
}

export default SearchBar