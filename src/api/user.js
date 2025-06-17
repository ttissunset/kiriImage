import apiClient from './client'

/**
 * 用户登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @param {string} verificationCode 验证码
 * @returns {Promise<Object>} 登录结果，包含token和用户信息
 */
export const login = async (username, password, code) => {
  try {
    const response = await apiClient.post('/api/user/login', { username, password, code })
    return response.data
  } catch (error) {
    console.error('登录失败:', error)
    throw error
  }
}

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} 用户信息
 */
export const getUserInfo = async () => {
  try {
    // 添加时间戳参数避免缓存
    const timestamp = new Date().getTime();
    const response = await apiClient.get('/api/user/info', {
      params: { t: timestamp }
    });
    return response.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 检查当前用户是否为管理员
 * @returns {Promise<Object>} 包含isAdmin字段的响应
 */
export const checkAdminStatus = async () => {
  try {
    const response = await apiClient.get('/api/user/admin-status');
    return response.data;
  } catch (error) {
    console.error('检查管理员状态失败:', error);
    throw error;
  }
}

/**
 * 更新用户信息
 * @param {Object} updateData 更新数据
 * @param {string} [updateData.nickname] 新昵称
 * @param {string} [updateData.avatar] 新头像URL
 * @returns {Promise<Object>} 更新结果
 */
export const updateUserInfo = async (updateData) => {
  try {
    const response = await apiClient.put('/api/user/update', updateData)
    return response.data
  } catch (error) {
    console.error('更新用户信息失败:', error)
    throw error
  }
}

/**
 * 发送邮箱验证码
 * @param {string} username 用户名
 * @returns {Promise<Object>} 发送结果
 */
export const sendVerificationCode = async (username) => {
  try {
    const response = await apiClient.post('/api/user/send-verification-code', { username });
    return response.data;
  } catch (error) {
    console.error('发送验证码失败:', error);
    throw error;
  }
} 