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

/**
 * 获取R2存储统计信息
 * @returns {Promise<Object>} R2存储统计数据
 */
export const getR2StorageStats = async () => {
  try {
    const response = await apiClient.get('/api/stats/r2-storage')
    return response.data
  } catch (error) {
    console.error('获取R2存储统计失败:', error)
    throw error
  }
}

/**
 * 获取上传记录
 * @param {Object} params 查询参数
 * @param {number} [params.page=1] 页码
 * @param {number} [params.limit=20] 每页记录数
 * @param {string} [params.username] 按上传用户名筛选
 * @param {string} [params.fileType] 按文件类型筛选，可选值: image, video
 * @param {string} [params.startDate] 开始日期，格式: YYYY-MM-DD
 * @param {string} [params.endDate] 结束日期，格式: YYYY-MM-DD
 * @returns {Promise<Object>} 上传记录数据
 */
export const getUploadRecords = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/stats/upload-records', { params })
    return response.data
  } catch (error) {
    console.error('获取上传记录失败:', error)
    throw error
  }
}

/**
 * 获取指定日期上传统计
 * @param {Object} params 查询参数
 * @param {string} [params.date] 指定查询日期，格式: YYYY-MM-DD，不传则默认为当天
 * @returns {Promise<Object>} 日期上传统计数据
 */
export const getDailyUploadStats = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/stats/daily-uploads', { params })
    return response.data
  } catch (error) {
    console.error('获取日期上传统计失败:', error)
    throw error
  }
}