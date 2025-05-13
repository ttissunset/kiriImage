import apiClient from './client'
import { isVideoFile } from '../utils/chunkUpload'

/**
 * 获取图片列表
 * @param {Object} params 请求参数
 * @param {number} [params.page=1] 当前页码
 * @param {number} [params.limit=50] 每页数量
 * @param {string} [params.sort='date_desc'] 排序方式
 * @returns {Promise<Object>} 图片列表数据
 */
export const getImages = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/image/list', { params })
    return response.data
  } catch (error) {
    console.error('获取图片列表失败:', error)
    throw error
  }
}

/**
 * 上传图片
 * @param {FormData} formData 包含图片文件和相关信息的FormData对象
 * @param {Object} options 上传选项
 * @param {Function} [options.onUploadProgress] 上传进度回调函数
 * @returns {Promise<Object>} 上传结果
 */
export const uploadImage = async (formData, options = {}) => {
  try {
    const file = formData.get('file')
    
    // 如果是视频文件，不通过此函数上传，因为视频需要使用切片上传
    if (file && isVideoFile(file)) {
      throw new Error('视频文件请使用视频上传功能')
    }
    
    const response = await apiClient.post('/api/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: options.onUploadProgress
    })
    return response.data
  } catch (error) {
    console.error('上传图片失败:', error)
    throw error
  }
}

/**
 * 删除图片
 * @param {string} imageId 图片ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteImage = async (imageId) => {
  try {
    const response = await apiClient.delete(`/api/image/${imageId}`)
    return response.data
  } catch (error) {
    console.error('删除图片失败:', error)
    throw error
  }
}

/**
 * 批量删除图片
 * @param {Array<string>} imageIds 图片ID数组
 * @returns {Promise<Object>} 批量删除结果
 */
export const batchDeleteImages = async (imageIds) => {
  try {
    const response = await apiClient.post('/api/image/batch-delete', { imageIds })
    return response.data
  } catch (error) {
    console.error('批量删除图片失败:', error)
    throw error
  }
}

/**
 * 更新图片信息
 * @param {string} imageId 图片ID
 * @param {Object} updateData 更新数据
 * @param {string} [updateData.name] 新图片名称
 * @param {string} [updateData.description] 新图片描述
 * @returns {Promise<Object>} 更新结果
 */
export const updateImage = async (imageId, updateData) => {
  try {
    const response = await apiClient.put(`/api/image/${imageId}`, updateData)
    return response.data
  } catch (error) {
    console.error('更新图片信息失败:', error)
    throw error
  }
}

/**
 * 获取图片详情
 * @param {string} imageId 图片ID
 * @returns {Promise<Object>} 图片详情
 */
export const getImageDetails = async (imageId) => {
  try {
    const response = await apiClient.get(`/api/image/detail/${imageId}`)
    return response.data
  } catch (error) {
    console.error('获取图片详情失败:', error)
    throw error
  }
}

/**
 * 批量上传图片
 * @param {FormData} formData 包含多个图片文件和相关信息的FormData对象
 * @param {Object} params 请求参数
 * @param {number} [params.count=10] 限制处理的文件数量
 * @param {Object} options 上传选项
 * @param {Function} [options.onUploadProgress] 上传进度回调函数
 * @returns {Promise<Object>} 批量上传结果
 */
export const batchUploadImages = async (formData, params = {}, options = {}) => {
  try {
    // 检查FormData中是否有视频文件
    const files = formData.getAll('files')
    if (files.some(file => isVideoFile(file))) {
      throw new Error('批量上传不支持视频文件，请单独上传视频')
    }
    
    const response = await apiClient.post('/api/image/batch-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params,
      onUploadProgress: options.onUploadProgress
    })
    return response.data
  } catch (error) {
    console.error('批量上传图片失败:', error)
    throw error
  }
} 