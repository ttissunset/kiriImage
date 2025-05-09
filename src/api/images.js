import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
  baseURL: 'https://www.loliapi.com/bg/',
  headers: {
    // 不需要授权头部
  }
})

// 从API获取图片
export const getImages = async () => {
  try {
    // 使用模拟数据
    const mockImages = Array(60).fill().map((_, index) => {
      // 使用当前时间戳+随机数确保每次获取的都是不同的图片
      const id = index + 1;
      return {
        id: `img-${id}`,
        name: `图片 ${id}`,
        url: `https://img.loliapi.cn/i/pe/img${id}.webp`,
        thumbnailUrl: `https://img.loliapi.cn/i/pe/img${id}.webp`,
        description: `这是图片${id}的描述`,
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString()
      }
    })

    return mockImages
  } catch (error) {
    console.error('获取图片失败:', error)
    throw error
  }
}

// 获取单张图片详情
export const getImageDetails = async (id) => {
  try {
    // 从ID中提取索引
    const index = parseInt(id.replace('img-', ''));
    // 生成随机参数避免缓存
    const randomParam = `${new Date().getTime()}-${Math.random()}`;

    // 模拟数据
    return {
      id,
      name: `图片 ${index}`,
      url: `https://www.loliapi.com/bg/?${randomParam}`,
      description: `这是图片${index}的详细描述`,
      date: new Date().toISOString(),
      format: 'jpg',
      size: '1.2MB'
    }
  } catch (error) {
    console.error('获取图片详情失败:', error)
    throw error
  }
} 