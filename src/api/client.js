import axios from 'axios'

// 根据环境确定基础URL
const baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://api.kirii.site'  // 生产环境使用实际域名
  : 'http://localhost:3000'   // 开发环境使用localhost

// 创建共享的axios实例
const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 添加请求拦截器，为请求添加Authorization头
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 添加响应拦截器，处理401错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // 如果是401错误，清除token并重定向到登录页
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient 