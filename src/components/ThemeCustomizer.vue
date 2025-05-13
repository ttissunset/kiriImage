<template>
  <div v-if="isOpen" class="fixed z-50 bg-background rounded-lg border shadow-lg w-64" ref="customizer" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between border-b p-3">
      <h2 class="text-sm font-semibold">主题自定义</h2>
      <div class="flex items-center">
        <button class="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted" @click="resetTheme" title="重置主题">
          <ArrowPathIcon class="h-4 w-4" />
        </button>
        <button class="ml-1 flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted" @click="closeCustomizer" title="关闭">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- 设置内容区 -->
    <div class="max-h-[60vh] overflow-y-auto p-3">
      <!-- 颜色设置 -->
      <div class="mb-4">
        <h3 class="mb-2 text-xs font-medium">颜色</h3>
        <div class="grid grid-cols-4 gap-2">
          <button v-for="color in colors" :key="color.name" class="flex flex-col items-center gap-1 rounded-md border p-1 text-[10px] transition-colors hover:bg-accent" :class="{ 'ring-2 ring-primary ring-offset-1': selectedColor === color.name }" @click="setColor(color.name)">
            <span class="h-6 w-6 rounded-full shadow-sm color-preview" :style="{ '--preview-color': color.value }"></span>
            <span>{{ color.name }}</span>
          </button>
        </div>
      </div>

      <!-- 圆角设置 -->
      <div class="mb-4">
        <h3 class="mb-2 text-xs font-medium">圆角</h3>
        <div class="grid grid-cols-5 gap-2">
          <button v-for="radius in radiusOptions" :key="radius" class="flex items-center justify-center rounded-md border p-2 text-xs transition-colors hover:bg-accent" :class="{ 'ring-1 ring-primary': selectedRadius === radius }" @click="setRadius(radius)">
            {{ radius }}
          </button>
        </div>
      </div>

      <!-- 主题切换 -->
      <div>
        <h3 class="mb-2 text-xs font-medium">主题</h3>
        <div class="grid grid-cols-2 gap-2">
          <button class="flex items-center justify-center gap-1 rounded-md border p-2 text-xs transition-colors hover:bg-accent" :class="{ 'ring-1 ring-primary': theme === 'light' }" @click="setTheme('light')">
            <SunIcon class="h-3 w-3" />
            浅色
          </button>
          <button class="flex items-center justify-center gap-1 rounded-md border p-2 text-xs transition-colors hover:bg-accent" :class="{ 'ring-1 ring-primary': theme === 'dark' }" @click="setTheme('dark')">
            <MoonIcon class="h-3 w-3" />
            深色
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, onUnmounted } from 'vue'
import {
  ArrowPathIcon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  triggerEl: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(props.modelValue)
const theme = ref('light')
const selectedColor = ref('红色')
const selectedRadius = ref('0.5')
const customizer = ref(null)
const position = ref({ top: 0, left: 0 })

// 颜色选项 - 精确匹配图片中的颜色值
const colors = [
  { name: '锌灰', value: '#71717A' },
  { name: '黑色', value: '#000000' },
  { name: '浅粉', value: '#ff6f91' },
  { name: '红色', value: '#EF4444' },
  { name: '玫瑰红', value: '#E11D48' },
  { name: '橙色', value: '#F97316' },
  { name: '绿色', value: '#22C55E' },
  { name: '蓝色', value: '#3B82F6' },
  { name: '黄色', value: '#EAB308' },
  { name: '紫色', value: '#8B5CF6' },
  { name: '淡紫', value: '#fbeaff' },
  { name: '青色', value: '#06B6D4' },
]

// 圆角选项
const radiusOptions = ['0', '0.25', '0.5', '0.75', '1']

// 计算弹窗位置
const calculatePosition = () => {
  if (!props.triggerEl) return

  const rect = props.triggerEl.getBoundingClientRect()
  const windowWidth = window.innerWidth

  // 默认在按钮右侧显示
  let left = rect.right + 10
  let top = rect.top - 10

  // 如果右侧空间不足，则显示在左侧
  if (left + 256 > windowWidth) {
    left = rect.left - 256 - 10
  }

  // 确保弹窗不会超出屏幕底部
  const windowHeight = window.innerHeight
  const customizerHeight = 400 // 估计高度
  if (top + customizerHeight > windowHeight) {
    top = windowHeight - customizerHeight - 10
  }

  // 确保顶部不会超出屏幕
  if (top < 10) {
    top = 10
  }

  position.value = { top, left }
}

// 监听modelValue变化
watch(() => props.modelValue, (val) => {
  isOpen.value = val
  if (val) {
    // 打开弹窗时计算位置
    setTimeout(() => {
      calculatePosition()
    }, 0)
  }
})

// 关闭自定义器
const closeCustomizer = () => {
  isOpen.value = false
  emit('update:modelValue', false)
}

// 设置颜色 - 更新全局UI元素的颜色
const setColor = (color) => {
  selectedColor.value = color
  const colorValue = getColorValue(color)
  
  // 应用颜色到所有UI元素
  updateCSSColorVariables(colorValue)

  // 保存设置
  localStorage.setItem('app-color', color)
}

// 更新所有CSS颜色变量，适用于全局UI元素
const updateCSSColorVariables = (hexColor) => {
  const color = hexColor.replace('#', '')
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)
  const rgbStr = `${r} ${g} ${b}`

  // 更新基础变量
  document.documentElement.style.setProperty('--primary-rgb', rgbStr)
  document.documentElement.style.setProperty('--primary', rgbStr)
  document.documentElement.style.setProperty('--ring', rgbStr)

  // 生成不同透明度的变体
  document.documentElement.style.setProperty('--primary-70', `rgba(${r}, ${g}, ${b}, 0.7)`)
  document.documentElement.style.setProperty('--primary-80', `rgba(${r}, ${g}, ${b}, 0.8)`)
  document.documentElement.style.setProperty('--primary-90', `rgba(${r}, ${g}, ${b}, 0.9)`)
  document.documentElement.style.setProperty('--primary-30', `rgba(${r}, ${g}, ${b}, 0.3)`)

  // 生成不同亮度的变体
  const lighterColor = adjustColorLightness(hexColor, 0.2) // 变亮20%
  const darkerColor = adjustColorLightness(hexColor, -0.2) // 变暗20%

  // 添加高光变体
  const lighterRGB = getRGBValues(lighterColor)
  document.documentElement.style.setProperty('--primary-highlight', lighterRGB)

  // 添加阴影变体
  const darkerRGB = getRGBValues(darkerColor)
  document.documentElement.style.setProperty('--primary-shadow', darkerRGB)
  
  // 更新主要UI组件的颜色变量
  document.documentElement.style.setProperty('--tw-ring-color', `rgb(${rgbStr})`)
}

// 调整颜色亮度
const adjustColorLightness = (hex, amount) => {
  let r = parseInt(hex.substring(1, 3), 16)
  let g = parseInt(hex.substring(3, 5), 16)
  let b = parseInt(hex.substring(5, 7), 16)

  // 增加或减少亮度
  r = Math.min(255, Math.max(0, Math.round(r + (amount * 255))))
  g = Math.min(255, Math.max(0, Math.round(g + (amount * 255))))
  b = Math.min(255, Math.max(0, Math.round(b + (amount * 255))))

  // 转回十六进制
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// 设置圆角
const setRadius = (radius) => {
  selectedRadius.value = radius
  document.documentElement.style.setProperty('--radius', `${radius}rem`)
  localStorage.setItem('app-radius', radius)
}

// 设置主题
const setTheme = (newTheme) => {
  theme.value = newTheme
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('app-theme', newTheme)
}

// 重置主题
const resetTheme = () => {
  setColor('红色')
  setRadius('0.5')
  setTheme('light')
}

// 获取颜色值
const getColorValue = (colorName) => {
  const colorObj = colors.find(c => c.name === colorName)
  if (!colorObj) {
    console.warn(`颜色 "${colorName}" 未找到，使用默认红色`)
    return '#EF4444' // 默认红色
  }
  return colorObj.value
}

// 将颜色HEX转换为RGB
const getRGBValues = (hex) => {
  hex = hex.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  return `${r} ${g} ${b}`
}

// 监听点击事件，点击外部关闭弹窗
const handleClickOutside = (event) => {
  if (isOpen.value && customizer.value && !customizer.value.contains(event.target) && props.triggerEl && !props.triggerEl.contains(event.target)) {
    closeCustomizer()
  }
}

// 窗口调整大小时重新计算位置
const handleResize = () => {
  if (isOpen.value) {
    calculatePosition()
  }
}

// 初始化
onMounted(() => {
  // 从本地存储加载主题设置
  const savedColor = localStorage.getItem('app-color')
  const savedRadius = localStorage.getItem('app-radius')
  const savedTheme = localStorage.getItem('app-theme')

  // 确保主题变量在初始化时立即生效
  if (savedColor) {
    setColor(savedColor)
  } else {
    // 如果没有保存的颜色，确保默认颜色也被正确应用
    const defaultColor = '红色'
    setColor(defaultColor)
  }
  
  if (savedRadius) setRadius(savedRadius)
  if (savedTheme) setTheme(savedTheme)

  // 添加点击外部关闭事件
  document.addEventListener('mousedown', handleClickOutside)
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize)
})

// 在组件销毁时移除事件监听
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
</script> 