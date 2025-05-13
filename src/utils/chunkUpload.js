/**
 * 视频文件切片上传工具
 * 只用于视频文件的切片上传，处理大型视频文件的上传任务
 */

import CryptoJS from 'crypto-js';
import apiClient from '../api/client';

// 默认切片大小为2MB
const DEFAULT_CHUNK_SIZE = 2 * 1024 * 1024;

/**
 * 计算文件的MD5哈希值
 * @param {File} file 要计算哈希的文件
 * @returns {Promise<string>} 返回文件的MD5哈希值
 */
export const calculateFileMD5 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const result = CryptoJS.MD5(CryptoJS.enc.Latin1.parse(e.target.result)).toString();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

/**
 * 将文件切片
 * @param {File} file 要切片的文件
 * @param {number} chunkSize 切片大小，单位为字节
 * @returns {Array<Blob>} 文件切片数组
 */
export const createChunks = (file, chunkSize = DEFAULT_CHUNK_SIZE) => {
  const chunks = [];
  let start = 0;
  
  while (start < file.size) {
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    chunks.push(chunk);
    start = end;
  }
  
  return chunks;
};

/**
 * 验证文件分片上传状态
 * @param {string} fileHash 文件的MD5哈希值
 * @param {number} chunkTotal 文件分片总数
 * @returns {Promise<Object>} 验证结果
 */
export const verifyFileChunks = async (fileHash, chunkTotal) => {
  try {
    const response = await apiClient.get('/api/chunk/verify', {
      params: {
        fileHash,
        chunkTotal
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('验证分片失败:', error);
    throw error;
  }
};

/**
 * 上传单个分片
 * @param {Blob} chunk 分片数据
 * @param {string} fileHash 文件的MD5哈希值
 * @param {number} chunkIndex 分片索引
 * @param {number} chunkTotal 分片总数
 * @param {Function} onProgress 上传进度回调函数
 * @returns {Promise<Object>} 上传结果
 */
export const uploadChunk = async (chunk, fileHash, chunkIndex, chunkTotal, onProgress) => {
  const formData = new FormData();
  formData.append('file', chunk);
  formData.append('fileHash', fileHash);
  formData.append('chunkIndex', chunkIndex);
  formData.append('chunkTotal', chunkTotal);
  
  try {
    const response = await apiClient.post('/api/chunk/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        onProgress(chunkIndex, progressEvent.loaded, progressEvent.total);
      } : undefined
    });
    return response.data;
  } catch (error) {
    console.error(`上传分片[${chunkIndex}]失败:`, error);
    throw error;
  }
};

/**
 * 合并文件分片
 * @param {string} fileHash 文件的MD5哈希值
 * @param {string} fileName 文件名
 * @param {number} chunkTotal 分片总数
 * @param {string} description 文件描述
 * @returns {Promise<Object>} 合并结果
 */
export const mergeFileChunks = async (fileHash, fileName, chunkTotal, description = '') => {
  try {
    const response = await apiClient.post('/api/chunk/merge', {
      fileHash,
      fileName,
      chunkTotal,
      description
    });
    return response.data;
  } catch (error) {
    console.error('合并分片失败:', error);
    throw error;
  }
};

/**
 * 清理过期分片
 * @param {number} expireHours 过期时间（小时）
 * @returns {Promise<Object>} 清理结果
 */
export const cleanupChunks = async (expireHours = 24) => {
  try {
    const response = await apiClient.delete('/api/chunk/cleanup', {
      params: {
        expireHours
      }
    });
    return response.data;
  } catch (error) {
    console.error('清理过期分片失败:', error);
    throw error;
  }
};

/**
 * 完整的文件分片上传流程
 * @param {File} file 要上传的文件
 * @param {Object} options 上传选项
 * @param {number} options.chunkSize 分片大小，默认2MB
 * @param {string} options.description 文件描述
 * @param {Function} options.onProgress 上传进度回调
 * @param {Function} options.onError 上传错误回调
 * @param {Function} options.onSuccess 上传成功回调
 * @returns {Promise<Object>} 上传结果
 */
export const uploadFileInChunks = async (file, options = {}) => {
  const {
    chunkSize = DEFAULT_CHUNK_SIZE,
    description = '',
    onProgress,
    onError,
    onSuccess
  } = options;
  
  try {
    // 1. 计算文件hash
    const fileHash = await calculateFileMD5(file);
    
    // 2. 创建分片
    const chunks = createChunks(file, chunkSize);
    const chunkTotal = chunks.length;
    
    // 3. 验证已上传的分片
    const { uploadedChunks = [], isComplete = false } = await verifyFileChunks(fileHash, chunkTotal);
    
    // 如果已完成上传，直接返回
    if (isComplete) {
      onSuccess && onSuccess({ fileHash, fileName: file.name });
      return { success: true, message: '文件已存在' };
    }
    
    // 4. 上传缺失的分片
    const uploadTasks = [];
    const pendingChunks = [];
    
    // 记录各个分片的上传进度
    const chunkProgressMap = new Map();
    chunks.forEach((_, index) => {
      chunkProgressMap.set(index, 0);
    });
    
    // 更新总进度的函数
    const updateTotalProgress = () => {
      if (!onProgress) return;
      
      let loaded = 0;
      let total = file.size;
      
      chunkProgressMap.forEach((progress) => {
        loaded += progress;
      });
      
      const percentage = Math.floor((loaded / total) * 100);
      onProgress({ loaded, total, percentage });
    };
    
    // 处理单个分片上传进度
    const handleChunkProgress = (chunkIndex, chunkLoaded, chunkTotal) => {
      chunkProgressMap.set(chunkIndex, (chunkLoaded / chunkTotal) * (chunks[chunkIndex].size));
      updateTotalProgress();
    };
    
    // 找出需要上传的分片
    for (let i = 0; i < chunkTotal; i++) {
      if (!uploadedChunks.includes(i)) {
        pendingChunks.push(i);
        uploadTasks.push(
          uploadChunk(chunks[i], fileHash, i, chunkTotal, handleChunkProgress)
        );
      } else {
        // 对于已上传的分片，设置进度为100%
        chunkProgressMap.set(i, chunks[i].size);
      }
    }
    
    // 初始化进度
    updateTotalProgress();
    
    // 并行上传所有分片
    await Promise.all(uploadTasks);
    
    // 5. 合并分片
    const mergeRes = await mergeFileChunks(fileHash, file.name, chunkTotal, description);
    
    // 上传成功回调
    onSuccess && onSuccess(mergeRes.data);
    
    return mergeRes;
  } catch (error) {
    // 上传错误回调
    onError && onError(error);
    throw error;
  }
};

/**
 * 暂停上传任务 (通过中断Promise来实现)
 * @param {AbortController} abortController 中断控制器
 */
export const pauseUpload = (abortController) => {
  if (abortController) {
    abortController.abort();
  }
};

/**
 * 恢复上传任务
 * @param {File} file 要上传的文件
 * @param {Object} options 上传选项
 * @returns {Promise<Object>} 上传结果
 */
export const resumeUpload = async (file, options = {}) => {
  return uploadFileInChunks(file, options);
};

/**
 * 判断是否为视频文件
 * @param {File} file 要检查的文件
 * @returns {boolean} 是否为视频文件
 */
export const isVideoFile = (file) => {
  return file && file.type && file.type.startsWith('video/');
};

export default {
  calculateFileMD5,
  createChunks,
  verifyFileChunks,
  uploadChunk,
  mergeFileChunks,
  cleanupChunks,
  uploadFileInChunks,
  pauseUpload,
  resumeUpload,
  isVideoFile,
  DEFAULT_CHUNK_SIZE
}; 