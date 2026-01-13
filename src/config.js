// src/config.js
// 如果是本地开发，就用 localhost；如果是线上，我们稍后填线上的地址
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"