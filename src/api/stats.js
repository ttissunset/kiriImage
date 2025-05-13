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
 * 获取访问统计数据
 * @param {string} timeRange - 时间范围（天数）
 * @returns {Promise<Object>} 访问统计数据
 */
export const getVisitStats = async (timeRange) => {
  try {
    const response = await apiClient.get('/api/stats/visits', {
      params: { days: timeRange }
    })
    return response.data
  } catch (error) {
    console.error('获取访问统计失败:', error)
    throw error
  }
}

/**
 * 获取存储使用统计
 * @returns {Promise<Object>} 存储使用统计
 */
export const getStorageStats = async () => {
  try {
    const response = await apiClient.get('/api/stats/storage')
    return response.data
  } catch (error) {
    console.error('获取存储统计失败:', error)
    throw error
  }
}

/**
 * 获取用户活跃度数据
 * @param {string} timeRange - 时间范围（天数）
 * @returns {Promise<Object>} 用户活跃度数据
 */
export const getUserActivityStats = async (timeRange) => {
  try {
    const response = await apiClient.get('/api/stats/user-activity', {
      params: { days: timeRange }
    })
    return response.data
  } catch (error) {
    console.error('获取用户活跃度失败:', error)
    throw error
  }
}

/**
 * 获取最近上传数据
 * @param {number} limit - 获取条数限制
 * @returns {Promise<Object>} 最近上传数据
 */
export const getRecentUploads = async (limit = 5) => {
  try {
    const response = await apiClient.get('/api/stats/recent-uploads', {
      params: { limit }
    })
    return response.data
  } catch (error) {
    console.error('获取最近上传数据失败:', error)
    throw error
  }
} 