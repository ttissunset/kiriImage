import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFavorites, addToFavorites, removeFromFavorites, batchRemoveFromFavorites, checkFavoriteStatus } from '../api/favorites'

export const useFavoriteStore = defineStore('favorite', () => {
  // 状态
  const favorites = ref([])
  const selectedIds = ref(new Set())
  const isLoading = ref(false)
  const error = ref(null)
  const currentPage = ref(1)
  const limit = ref(50)
  const total = ref(0)

  // 计算属性
  const hasSelected = computed(() => selectedIds.value.size > 0)
  const selectedCount = computed(() => selectedIds.value.size)
  const allSelected = computed(() => {
    return favorites.value.length > 0 && selectedIds.value.size === favorites.value.length
  })

  // 获取收藏列表
  const fetchFavorites = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const params = {
        page: currentPage.value,
        limit: limit.value
      }
      
      const response = await getFavorites(params)
      
      if (response.code === 200) {
        favorites.value = response.data.items
        total.value = response.data.total
      } else {
        error.value = response.message || '获取收藏列表失败'
      }
    } catch (err) {
      error.value = '获取收藏列表失败: ' + (err.message || '未知错误')
      console.error('获取收藏列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 添加到收藏
  const addFavorite = async (imageId) => {
    try {
      const response = await addToFavorites(imageId)
      
      if (response.code === 200) {
        // 如果已经有收藏列表数据，向其中添加新收藏的项
        if (favorites.value.length > 0) {
          favorites.value.unshift(response.data)
          total.value++
        }
        
        return true
      } else {
        error.value = response.message || '添加收藏失败'
        return false
      }
    } catch (err) {
      error.value = '添加收藏失败: ' + (err.message || '未知错误')
      console.error('添加收藏失败:', err)
      return false
    }
  }

  // 从收藏中删除
  const removeFavorite = async (imageId) => {
    try {
      const response = await removeFromFavorites(imageId)
      
      if (response.code === 200) {
        // 从列表中移除
        const index = favorites.value.findIndex(fav => fav.imageId === imageId)
        if (index !== -1) {
          favorites.value.splice(index, 1)
          total.value--
        }
        
        // 从选中集合中移除
        if (selectedIds.value.has(imageId)) {
          selectedIds.value.delete(imageId)
        }
        
        // 导入消息提示存储
        const { useToastStore } = await import('../stores/toastStore')
        const toastStore = useToastStore()
        
        // 显示成功消息
        toastStore.success('已从收藏中移除')
        
        return true
      } else {
        error.value = response.message || '删除收藏失败'
        return false
      }
    } catch (err) {
      error.value = '删除收藏失败: ' + (err.message || '未知错误')
      console.error('删除收藏失败:', err)
      return false
    }
  }

  // 批量取消收藏
  const batchRemoveFavorites = async () => {
    if (selectedIds.value.size === 0) return false
    
    const imageIds = Array.from(selectedIds.value)
    
    try {
      const response = await batchRemoveFromFavorites(imageIds)
      
      if (response.code === 200) {
        // 新的API响应格式处理
        const successfulIds = response.data.succeeded.items.map(item => item.imageId)
        
        // 从列表中移除成功删除的收藏
        favorites.value = favorites.value.filter(fav => !successfulIds.includes(fav.imageId))
        total.value -= response.data.succeeded.count
        
        // 清空选择
        selectedIds.value.clear()
        
        // 导入消息提示存储
        const { useToastStore } = await import('../stores/toastStore')
        const toastStore = useToastStore()
        
        // 显示成功消息
        toastStore.success(`已从收藏中移除 ${response.data.succeeded.count} 张图片`)
        
        return true
      } else {
        error.value = response.message || '批量取消收藏失败'
        return false
      }
    } catch (err) {
      error.value = '批量取消收藏失败: ' + (err.message || '未知错误')
      console.error('批量取消收藏失败:', err)
      return false
    }
  }

  // 判断图片是否已收藏
  const isFavorite = (imageId) => {
    return favorites.value.some(fav => fav.imageId === imageId)
  }

  // 检查图片收藏状态（通过API）
  const checkFavorite = async (imageId) => {
    try {
      const response = await checkFavoriteStatus(imageId)
      
      if (response.code === 200) {
        return response.data.isFavorite
      } else {
        error.value = response.message || '检查收藏状态失败'
        return false
      }
    } catch (err) {
      error.value = '检查收藏状态失败: ' + (err.message || '未知错误')
      console.error('检查收藏状态失败:', err)
      return false
    }
  }

  // 选择相关方法
  const isSelected = (imageId) => selectedIds.value.has(imageId)
  
  const toggleSelect = (imageId) => {
    if (selectedIds.value.has(imageId)) {
      selectedIds.value.delete(imageId)
    } else {
      selectedIds.value.add(imageId)
    }
  }
  
  const selectAll = () => {
    favorites.value.forEach(fav => {
      selectedIds.value.add(fav.imageId)
    })
  }
  
  const clearSelection = () => {
    selectedIds.value.clear()
  }

  // 分页相关方法
  const changePage = async (page) => {
    currentPage.value = page
    await fetchFavorites()
  }

  return {
    // 状态
    favorites,
    selectedIds,
    isLoading,
    error,
    currentPage,
    limit,
    total,
    
    // 计算属性
    hasSelected,
    selectedCount,
    allSelected,
    
    // 方法
    fetchFavorites,
    addFavorite,
    removeFavorite,
    batchRemoveFavorites,
    isFavorite,
    checkFavorite,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    changePage
  }
}) 