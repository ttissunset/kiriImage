import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getImages, deleteImage, batchDeleteImages, updateImage } from '../api/images'

export const useGalleryStore = defineStore('gallery', () => {
  // 状态
  const images = ref([])
  const selectedIds = ref(new Set())
  const isLoading = ref(false)
  const isBackgroundLoading = ref(false) // 后台加载状态
  const error = ref(null)
  const currentPage = ref(1)
  const limit = ref(50)
  const total = ref(0)
  const sortBy = ref('date_desc')

  // 计算属性
  const hasSelected = computed(() => selectedIds.value.size > 0)
  const selectedCount = computed(() => selectedIds.value.size)
  const allSelected = computed(() => {
    return images.value.length > 0 && selectedIds.value.size === images.value.length
  })
  // 获取所有选中的图片对象
  const selectedImages = computed(() => {
    return images.value.filter(image => selectedIds.value.has(image.id))
  })

  // 获取图片列表（带loading状态）
  const fetchImages = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const params = {
        page: currentPage.value,
        limit: limit.value,
        sort: sortBy.value
      }
      
      const response = await getImages(params)
      
      if (response.code === 200) {
        images.value = response.data.items
        total.value = response.data.total
      } else {
        error.value = response.message || '获取图片列表失败'
      }
    } catch (err) {
      error.value = '获取图片列表失败: ' + (err.message || '未知错误')
      console.error('获取图片列表失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  // 后台获取图片列表（无感刷新）
  const fetchImagesInBackground = async () => {
    // 已经在加载中，避免重复请求
    if (isBackgroundLoading.value) return
    
    isBackgroundLoading.value = true
    // 不设置error，不影响用户体验
    
    try {
      const params = {
        page: currentPage.value,
        limit: limit.value,
        sort: sortBy.value
      }
      
      const response = await getImages(params)
      
      if (response.code === 200) {
        // 保留选中状态
        const selectedIdsArray = Array.from(selectedIds.value)
        
        // 更新数据
        images.value = response.data.items
        total.value = response.data.total
        
        // 恢复选中状态
        selectedIds.value = new Set(selectedIdsArray.filter(id => 
          images.value.some(img => img.id === id)
        ))
      }
    } catch (err) {
      console.error('后台获取图片列表失败:', err)
    } finally {
      isBackgroundLoading.value = false
    }
  }

  // 添加图片
  const addImage = (image) => {
    images.value.unshift(image)
    total.value++
  }

  // 删除图片（支持无感刷新）
  const deleteImageById = async (id) => {
    // 乐观更新UI
    const imageToDelete = images.value.find(img => img.id === id)
    const imageIndex = images.value.findIndex(img => img.id === id)
    
    // 备份数据，以便回滚
    const imageCopy = {...imageToDelete}
    
    // 从UI中移除
    if (imageIndex !== -1) {
      images.value.splice(imageIndex, 1)
      
      // 从选中集合中移除
      if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
    }
    }
    
    try {
      // 导入favoriteStore - 使用动态导入避免循环依赖
      const { useFavoriteStore } = await import('./favoriteStore')
      const favoriteStore = useFavoriteStore()
      
      // 获取当前收藏列表
      await favoriteStore.fetchFavorites()
      
      // 先检查是否在收藏列表中
      const isInFavorites = favoriteStore.isFavorite(id)
      
      // 删除图片
      const response = await deleteImage(id)
      
      if (response.code === 200) {
        // 删除成功
        total.value--
        
        try {
          // 如果图片在收藏中，也从收藏中删除
          if (isInFavorites) {
            await favoriteStore.removeFavorite(id)
  }

          // 重新获取相册数据和收藏数据
          await fetchImagesInBackground()
          await favoriteStore.fetchFavorites()
          
          // 触发图片删除事件，通知其他组件刷新数据
          window.dispatchEvent(new CustomEvent('image-deleted', { 
            detail: { imageIds: [id] } 
          }));
          
        } catch (favError) {
          console.error('从收藏中删除图片失败:', favError)
          // 不影响主流程，继续返回成功
        }
        
        return true
      } else {
        // 删除失败，回滚UI
        if (imageIndex !== -1) {
          images.value.splice(imageIndex, 0, imageCopy)
        }
        error.value = response.message || '删除图片失败'
        return false
      }
    } catch (err) {
      // 删除失败，回滚UI
      if (imageIndex !== -1) {
        images.value.splice(imageIndex, 0, imageCopy)
  }
      error.value = '删除图片失败: ' + (err.message || '未知错误')
      console.error('删除图片失败:', err)
      return false
    }
  }

  // 批量删除选中图片（支持无感刷新）
  const deleteSelectedImages = async () => {
    if (selectedIds.value.size === 0) return false
    
    const ids = Array.from(selectedIds.value)
    
    // 备份要删除的图片，以便回滚
    const imagesToDelete = images.value.filter(img => selectedIds.value.has(img.id))
    
    // 乐观更新UI
    images.value = images.value.filter(img => !selectedIds.value.has(img.id))
    const previousTotal = total.value
    total.value -= ids.length
    selectedIds.value.clear()
    
    try {
      // 导入favoriteStore - 使用动态导入避免循环依赖
      const { useFavoriteStore } = await import('./favoriteStore')
      const favoriteStore = useFavoriteStore()
      
      // 获取当前收藏列表
      await favoriteStore.fetchFavorites()
      
      // 查找需要从收藏中移除的图片ID
      const favoriteImagesToRemove = ids.filter(id => favoriteStore.isFavorite(id))
      
      // 执行批量删除操作
      const response = await batchDeleteImages(ids)
      
      if (response.code === 200) {
        try {
          // 如果有需要从收藏中删除的图片
          if (favoriteImagesToRemove.length > 0) {
            // 如果需要从收藏中删除多个图片，使用批量删除
            if (favoriteImagesToRemove.length > 1) {
              // 选择要删除的收藏
              favoriteImagesToRemove.forEach(id => favoriteStore.toggleSelect(id))
              await favoriteStore.batchRemoveFavorites()
            } else {
              // 只删除一个收藏
              await favoriteStore.removeFavorite(favoriteImagesToRemove[0])
    }
          }
          
          // 重新获取相册数据和收藏数据
          await fetchImagesInBackground()
          await favoriteStore.fetchFavorites()
          
          // 触发图片删除事件，通知其他组件刷新数据
          window.dispatchEvent(new CustomEvent('image-deleted', { 
            detail: { imageIds: ids } 
          }));
          
          return true
        } catch (favError) {
          console.error('从收藏中删除图片失败:', favError)
          // 不影响主流程，继续返回成功
          return true
        }
      } else {
        // 操作失败，回滚UI
        images.value = [...images.value, ...imagesToDelete]
        total.value = previousTotal
        ids.forEach(id => selectedIds.value.add(id))
        error.value = response.message || '批量删除图片失败'
        return false
      }
    } catch (err) {
      // 操作失败，回滚UI
      images.value = [...images.value, ...imagesToDelete]
      total.value = previousTotal
      ids.forEach(id => selectedIds.value.add(id))
      error.value = '批量删除图片失败: ' + (err.message || '未知错误')
      console.error('批量删除图片失败:', err)
      return false
    }
  }

  // 更新图片信息（支持无感刷新）
  const updateImageInfo = async (id, updateData) => {
    // 查找图片
    const index = images.value.findIndex(img => img.id === id)
    if (index === -1) return false
    
    // 备份原始数据，以便回滚
    const originalImage = {...images.value[index]}
    
    // 乐观更新UI
    images.value[index] = { ...images.value[index], ...updateData }
    
    try {
      const response = await updateImage(id, updateData)
      
      if (response.code === 200) {
        // 用服务器返回的数据更新
        images.value[index] = { ...images.value[index], ...response.data }
        return true
      } else {
        // 更新失败，回滚UI
        images.value[index] = originalImage
        error.value = response.message || '更新图片信息失败'
        return false
      }
    } catch (err) {
      // 更新失败，回滚UI
      images.value[index] = originalImage
      error.value = '更新图片信息失败: ' + (err.message || '未知错误')
      console.error('更新图片信息失败:', err)
      return false
    }
  }

  // 更新图片名称 (便捷方法)
  const updateImageName = async (id, newName) => {
    return await updateImageInfo(id, { name: newName })
    }

  // 选择相关方法
  const isSelected = (id) => selectedIds.value.has(id)
  
  const toggleSelect = (id) => {
    if (selectedIds.value.has(id)) {
      selectedIds.value.delete(id)
    } else {
      selectedIds.value.add(id)
    }
  }
  
  const selectAll = () => {
    images.value.forEach(img => {
      selectedIds.value.add(img.id)
    })
  }
  
  const clearSelection = () => {
    selectedIds.value.clear()
  }

  // 分页相关方法
  const changePage = async (page) => {
    currentPage.value = page
    await fetchImages()
  }
  
  const changeSort = async (sort) => {
    sortBy.value = sort
    await fetchImages()
  }

  return {
    // 状态
    images,
    selectedIds,
    isLoading,
    isBackgroundLoading,
    error,
    currentPage,
    limit,
    total,
    sortBy,
    
    // 计算属性
    hasSelected,
    selectedCount,
    allSelected,
    selectedImages,
    
    // 方法
    fetchImages,
    fetchImagesInBackground,
    addImage,
    deleteImage: deleteImageById,
    deleteSelectedImages,
    updateImageInfo,
    updateImageName,
    isSelected,
    toggleSelect,
    selectAll,
    clearSelection,
    changePage,
    changeSort
  }
}) 