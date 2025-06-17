import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  // 存储所有toast消息
  const toasts = ref([])

  // 生成唯一ID
  let nextId = 1

  // 通用创建Toast的方法
  const createToast = (options) => {
    const id = nextId++
    const defaultOptions = {
      id,
      type: 'info',
      duration: 3000, // 默认3秒后消失
      isModal: false  // 默认不是模态对话框
    }

    const toast = { ...defaultOptions, ...options }
    toasts.value.push(toast)
    return id
  }

  // 创建不同类型的Toast
  const info = (message, options = {}) => createToast({
    message,
    type: 'info',
    ...options
  })

  const success = (message, options = {}) => createToast({
    message,
    type: 'success',
    ...options
  })

  const warning = (message, options = {}) => createToast({
    message,
    type: 'warning',
    ...options
  })

  const error = (message, options = {}) => createToast({
    message,
    type: 'error',
    ...options
  })

  // 显示确认对话框，返回一个Promise
  const confirm = (message, options = {}) => {
    return new Promise((resolve) => {
      const toastId = createToast({
        message,
        title: options.title || '确认',
        type: options.type || 'info',
        isModal: true,
        showCancel: true,
        cancelText: options.cancelText,
        confirmText: options.confirmText,
        duration: options.duration || 0, // 支持设置持续时间，默认不会自动消失
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });

      // 如果设置了自动关闭，则在指定时间后自动取消
      if (options.duration) {
        setTimeout(() => {
          const toast = getToastById(toastId);
          if (toast) {
            removeToast(toastId);
            resolve(false); // 自动消失视为取消操作
          }
        }, options.duration);
      }
    });
  }

  // 显示警告对话框，只有确认按钮
  const alert = (message, options = {}) => {
    return new Promise((resolve) => {
      createToast({
        message,
        title: options.title,
        type: options.type || 'info',
        isModal: true,
        showCancel: false,
        confirmText: options.confirmText || '确定',
        duration: 0, // 确认对话框不会自动消失
        onConfirm: () => resolve(true)
      })
    })
  }

  // 移除Toast
  const removeToast = (id) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  // 清除所有Toast
  const clearToasts = () => {
    toasts.value = []
  }

  // 通过ID获取Toast
  const getToastById = (id) => {
    return toasts.value.find(t => t.id === id)
  }

  return {
    toasts,
    info,
    success,
    warning,
    error,
    confirm,
    alert,
    removeToast,
    clearToasts,
    getToastById
  }
}) 