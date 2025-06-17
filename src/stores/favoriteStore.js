import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getFavorites, addToFavorites, removeFromFavorites, batchRemoveFromFavorites } from '../api/favorites'

// 创建独立的收藏选中状态存储
export const useFavoriteStore = defineStore('favorite', () => {
  // 状态
  const favorites = ref([])
  const selectedIds = ref(new Set()) // 收藏选中ID集合，仅在favorites视图中使用
  const isLoading = ref(false)
  const isLoadingMore = ref(false) // 加载更多状态
  const error = ref(null)
  const currentPage = ref(1)
  const limit = ref(50)
  const total = ref(0)
  const hasMore = ref(true) // 是否有更多数据

  // 计算属性
  const hasSelected = computed(() => selectedIds.value.size > 0)
  const selectedCount = computed(() => selectedIds.value.size)
  const allSelected = computed(() => {
    return favorites.value.length > 0 && selectedIds.value.size === favorites.value.length
  })
  // 获取所有选中的收藏对象
  const selectedFavorites = computed(() => {
    return favorites.value.filter(fav => selectedIds.value.has(fav.id))
  })

  // 获取收藏列表
  const fetchFavorites = async () => {
    isLoading.value = true
    error.value = null
    // 重置分页
    currentPage.value = 1
    // 清除选中状态，避免与之前的选择冲突
    clearSelection()

    try {
      const params = {
        page: currentPage.value,
        limit: limit.value
      }

      const response = await getFavorites(params)

      if (response.code === 200) {
        favorites.value = response.data.items
        total.value = response.data.total
        // 更新分页信息
        currentPage.value = response.data.page || 1
        limit.value = response.data.limit || 50
        // 更新是否有更多数据
        hasMore.value = favorites.value.length < total.value
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

  // 加载更多收藏
  const loadMoreFavorites = async () => {
    // 如果没有更多数据或已经在加载中，则不执行
    if (!hasMore.value || isLoadingMore.value) return

    isLoadingMore.value = true

    try {
      // 页码加1
      const nextPage = currentPage.value + 1

      const params = {
        page: nextPage,
        limit: limit.value
      }

      const response = await getFavorites(params)

      if (response.code === 200) {
        // 追加数据而不是替换
        favorites.value = [...favorites.value, ...response.data.items]
        total.value = response.data.total

        // 更新当前页码
        currentPage.value = response.data.page || nextPage

        // 更新是否有更多数据
        hasMore.value = favorites.value.length < total.value
      } else {
        error.value = response.message || '加载更多收藏失败'
      }
    } catch (err) {
      error.value = '加载更多收藏失败: ' + (err.message || '未知错误')
      console.error('加载更多收藏失败:', err)
    } finally {
      isLoadingMore.value = false
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
        const index = favorites.value.findIndex(fav => fav.id === imageId)
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
        favorites.value = favorites.value.filter(fav => !successfulIds.includes(fav.id))
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
    return favorites.value.some(fav => fav.id === imageId);
  }

  // 检查图片收藏状态（通过API）
  const checkFavorite = async (imageId) => {
    try {
      //   const response = await checkFavoriteStatus(imageId)
      return false
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
      selectedIds.value.add(fav.id)
    })
  }

  const clearSelection = () => {
    // 完全清除选中状态
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
    isLoadingMore,
    error,
    currentPage,
    limit,
    total,
    hasMore,

    // 计算属性
    hasSelected,
    selectedCount,
    allSelected,
    selectedFavorites,

    // 方法
    fetchFavorites,
    loadMoreFavorites,
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