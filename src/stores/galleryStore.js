import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getImages } from '../api/images'

export const useGalleryStore = defineStore('gallery', () => {
  const images = ref([])
  const selectedImages = ref([])
  const favoriteImages = ref([]) // 用于存储收藏图片的ID
  const isLoading = ref(false)
  const error = ref(null)

  const fetchImages = async () => {
    isLoading.value = true
    error.value = null
    try {
      const data = await getImages()
      images.value = data
    } catch (err) {
      error.value = err.message || '获取图片失败'
    } finally {
      isLoading.value = false
    }
  }

  const toggleSelect = (imageId) => {
    const index = selectedImages.value.indexOf(imageId)
    if (index === -1) {
      selectedImages.value.push(imageId)
    } else {
      selectedImages.value.splice(index, 1)
    }
  }

  // 切换收藏状态
  const toggleFavorite = (imageId) => {
    const index = favoriteImages.value.indexOf(imageId)
    if (index === -1) {
      favoriteImages.value.push(imageId)
    } else {
      favoriteImages.value.splice(index, 1)
    }
    // 保存收藏到本地存储
    localStorage.setItem('favorites', JSON.stringify(favoriteImages.value))
  }

  // 判断图片是否被收藏
  const isFavorite = (imageId) => {
    return favoriteImages.value.includes(imageId)
  }

  // 获取所有收藏的图片
  const getFavoriteImages = computed(() => {
    return images.value.filter(img => favoriteImages.value.includes(img.id))
  })

  const selectAll = () => {
    selectedImages.value = images.value.map(img => img.id)
  }

  const clearSelection = () => {
    selectedImages.value = []
  }

  const deleteImage = (imageId) => {
    images.value = images.value.filter(img => img.id !== imageId)
    // 从选中列表中移除
    const index = selectedImages.value.indexOf(imageId)
    if (index !== -1) {
      selectedImages.value.splice(index, 1)
    }
    // 从收藏列表中移除
    const favIndex = favoriteImages.value.indexOf(imageId)
    if (favIndex !== -1) {
      favoriteImages.value.splice(favIndex, 1)
      localStorage.setItem('favorites', JSON.stringify(favoriteImages.value))
    }
  }

  const deleteSelectedImages = () => {
    images.value = images.value.filter(img => !selectedImages.value.includes(img.id))

    // 从收藏中也移除被删除的图片
    favoriteImages.value = favoriteImages.value.filter(id => !selectedImages.value.includes(id))
    localStorage.setItem('favorites', JSON.stringify(favoriteImages.value))

    selectedImages.value = []
  }

  const updateImageName = (imageId, newName) => {
    const image = images.value.find(img => img.id === imageId)
    if (image) {
      image.name = newName
    }
  }

  const isSelected = (imageId) => {
    return selectedImages.value.includes(imageId)
  }

  const hasSelected = computed(() => selectedImages.value.length > 0)
  const selectedCount = computed(() => selectedImages.value.length)
  const favoriteCount = computed(() => favoriteImages.value.length)

  // 从本地存储加载收藏的图片
  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      favoriteImages.value = JSON.parse(savedFavorites)
    }
  }

  // 初始加载收藏
  loadFavorites()

  return {
    images,
    selectedImages,
    favoriteImages,
    isLoading,
    error,
    fetchImages,
    toggleSelect,
    toggleFavorite,
    isFavorite,
    getFavoriteImages,
    selectAll,
    clearSelection,
    deleteImage,
    deleteSelectedImages,
    updateImageName,
    isSelected,
    hasSelected,
    selectedCount,
    favoriteCount
  }
}) 