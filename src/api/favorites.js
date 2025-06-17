import apiClient from './client'

/**
 * 获取收藏列表
 * @param {Object} params 请求参数
 * @param {number} [params.page=1] 当前页码
 * @param {number} [params.limit=50] 每页数量
 * @returns {Promise<Object>} 收藏列表数据
 */
export const getFavorites = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/favorite/list', { params })
    return response.data
  } catch (error) {
    console.error('获取收藏列表失败:', error)
    throw error
  }
}

/**
 * 添加到收藏
 * @param {string} imageId 图片ID
 * @returns {Promise<Object>} 添加结果
 */
export const addToFavorites = async (imageId) => {
  try {
    const response = await apiClient.post(`/api/favorite/add/${imageId}`)
    return response.data
  } catch (error) {
    console.error('添加收藏失败:', error)
    throw error
  }
}

/**
 * 从收藏中删除
 * @param {string} imageId 图片ID
 * @returns {Promise<Object>} 删除结果
 */
export const removeFromFavorites = async (imageId) => {
  try {
    const response = await apiClient.delete(`/api/favorite/remove/${imageId}`)
    return response.data
  } catch (error) {
    console.error('删除收藏失败:', error)
    throw error
  }
}

/**
 * 批量取消收藏
 * @param {Array<string>} imageIds 图片ID数组
 * @returns {Promise<Object>} 批量取消结果
 */
export const batchRemoveFromFavorites = async (imageIds) => {
  try {
    const response = await apiClient.delete('/api/favorite/batch', {
      data: { imageIds }
    })
    return response.data
  } catch (error) {
    console.error('批量取消收藏失败:', error)
    throw error
  }
}

/**
 * 批量添加到收藏
 * @param {Array<string>} imageIds 图片ID数组
 * @returns {Promise<Object>} 批量添加结果
 */
export const batchAddToFavorites = async (imageIds) => {
  try {
    const response = await apiClient.post('/api/favorite/batch', { imageIds })
    return response.data
  } catch (error) {
    console.error('批量添加收藏失败:', error)
    throw error
  }
} 