import apiClient from './client'

/**
 * 获取系统信息
 * @returns {Promise<Object>} 系统信息数据
 */
export const getSystemInfo = async () => {
  try {
    const response = await apiClient.get('/api/stats/system')
    return response.data
  } catch (error) {
    console.error('获取系统信息失败:', error)
    throw error
  }
}

/**
 * 获取登录记录
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.limit=20] 每页记录数
 * @param {string} [params.username] 按用户名筛选
 * @param {string} [params.status] 按登录状态筛选，可选值: success, failure
 * @returns {Promise<Object>} 登录记录数据
 */
export const getLoginRecords = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/stats/login-records', { params })
    return response.data
  } catch (error) {
    console.error('获取登录记录失败:', error)
    throw error
  }
}

/**
 * 获取所有用户信息
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.limit=20] 每页记录数
 * @param {string} [params.keyword] 按用户名搜索
 * @returns {Promise<Object>} 用户信息数据
 */
export const getAllUsers = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/stats/users', { params })
    return response.data
  } catch (error) {
    console.error('获取用户信息失败:', error)
    throw error
  }
}