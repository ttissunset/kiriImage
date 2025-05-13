import { defineStore } from 'pinia'
import { ref } from 'vue'

// 图片显示模式: 'fill' - 填充模式，'original' - 原始比例模式
export const useAppStore = defineStore('app', () => {
  // 图片显示模式 - 本地存储
  const storedDisplayMode = localStorage.getItem('imageDisplayMode')
  const imageDisplayMode = ref(storedDisplayMode || 'fill')

  // 切换图片显示模式
  const toggleDisplayMode = () => {
    imageDisplayMode.value = imageDisplayMode.value === 'fill' ? 'original' : 'fill'
    // 保存到本地存储
    localStorage.setItem('imageDisplayMode', imageDisplayMode.value)
  }

  return {
    imageDisplayMode,
    toggleDisplayMode
  }
}) 