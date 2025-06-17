import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as apiLogin, getUserInfo, checkAdminStatus } from '../api/user'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const isAdmin = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value)

  // 初始化方法 - 如果有token，尝试获取用户信息
  const initialize = async () => {
    if (token.value) {
      try {
        await fetchUserInfo()
        await fetchAdminStatus()
      } catch (err) {
        // 如果获取用户信息失败(如token过期)，则清除token并重定向到登录页
        logout()
      }
    }
  }

  // 登录方法
  const login = async (username, password, verificationCode) => {
    loading.value = true
    error.value = null

    try {
      const response = await apiLogin(username, password, verificationCode)

      if (response.code === 200) {
        token.value = response.data.token
        user.value = response.data.user

        // 保存token到本地存储
        localStorage.setItem('token', token.value)

        // 登录成功后清除验证码倒计时结束时间
        localStorage.removeItem('verificationCodeEndTime');

        // 获取管理员状态
        await fetchAdminStatus()

        // 登录成功后重定向到首页
        router.push('/')
        return true
      } else {
        error.value = response.message || '登录失败'
        return false
      }
    } catch (err) {
      error.value = err.message || '登录失败'
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return false

    try {
      const response = await getUserInfo()

      if (response.code === 200) {
        user.value = response.data
        return true
      } else {
        return false
      }
    } catch (err) {
      // 如果获取用户信息失败(如token过期)，则清除token
      logout()
      return false
    }
  }

  // 获取管理员状态
  const fetchAdminStatus = async () => {
    if (!token.value) return false

    try {
      const response = await checkAdminStatus()

      if (response.code === 200) {
        isAdmin.value = response.data.isAdmin
        return true
      } else {
        isAdmin.value = false
        return false
      }
    } catch (err) {
      isAdmin.value = false
      return false
    }
  }

  // 更新用户信息
  const updateUser = (updatedUser) => {
    user.value = updatedUser
  }

  // 登出方法
  const logout = () => {
    // 清除token和用户信息
    token.value = ''
    user.value = null
    isAdmin.value = false
    localStorage.removeItem('token')

    // 重定向到登录页
    router.push('/login')
  }

  return {
    // 状态
    token,
    user,
    loading,
    error,
    isAdmin,

    // 计算属性
    isAuthenticated,

    // 方法
    initialize,
    login,
    logout,
    fetchUserInfo,
    fetchAdminStatus,
    updateUser
  }
}) 