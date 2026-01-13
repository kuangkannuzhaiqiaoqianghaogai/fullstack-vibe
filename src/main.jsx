// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// 👇 1. 引入总开关
import { ChakraProvider } from '@chakra-ui/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 👇 2. 用开关包裹住 App */}
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)