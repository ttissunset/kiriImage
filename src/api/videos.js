import apiClient from './client'
import { uploadFileInChunks, isVideoFile } from '../utils/chunkUpload'

/**
 * 上传视频文件 - 自动使用切片上传
 * @param {File} file 视频文件
 * @param {Object} options 上传选项
 * @param {string} [options.description=''] 视频描述
 * @param {number} [options.chunkSize] 分片大小，默认2MB
 * @param {Function} [options.onProgress] 上传进度回调
 * @param {Function} [options.onError] 上传错误回调
 * @param {Function} [options.onSuccess] 上传成功回调
 * @returns {Promise<Object>} 上传结果
 */
export const uploadVideo = async (file, options = {}) => {
  if (!file) {
    throw new Error('请选择视频文件')
  }
  
  if (!isVideoFile(file)) {
    throw new Error('请上传正确的视频格式')
  }
  
  try {
    return await uploadFileInChunks(file, options)
  } catch (error) {
    console.error('上传视频失败:', error)
    throw error
  }
}

/**
 * 获取视频列表
 * @param {Object} params 请求参数
 * @param {number} [params.page=1] 当前页码
 * @param {number} [params.limit=50] 每页数量
 * @param {string} [params.sort='date_desc'] 排序方式
 * @returns {Promise<Object>} 视频列表数据
 */
export const getVideos = async (params = {}) => {
  try {
    const response = await apiClient.get('/api/video/list', { params })
    return response.data
  } catch (error) {
    console.error('获取视频列表失败:', error)
    throw error
  }
}

/**
 * 删除视频
 * @param {string} videoId 视频ID
 * @returns {Promise<Object>} 删除结果
 */
export const deleteVideo = async (videoId) => {
  try {
    const response = await apiClient.delete(`/api/video/${videoId}`)
    return response.data
  } catch (error) {
    console.error('删除视频失败:', error)
    throw error
  }
}

/**
 * 更新视频信息
 * @param {string} videoId 视频ID
 * @param {Object} updateData 更新数据
 * @param {string} [updateData.name] 新视频名称
 * @param {string} [updateData.description] 新视频描述
 * @returns {Promise<Object>} 更新结果
 */
export const updateVideo = async (videoId, updateData) => {
  try {
    const response = await apiClient.put(`/api/video/${videoId}`, updateData)
    return response.data
  } catch (error) {
    console.error('更新视频信息失败:', error)
    throw error
  }
}

/**
 * 获取视频详情
 * @param {string} videoId 视频ID
 * @returns {Promise<Object>} 视频详情
 */
export const getVideoDetails = async (videoId) => {
  try {
    const response = await apiClient.get(`/api/video/detail/${videoId}`)
    return response.data
  } catch (error) {
    console.error('获取视频详情失败:', error)
    throw error
  }
} 