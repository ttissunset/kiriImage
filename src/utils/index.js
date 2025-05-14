/**
 * 防抖函数 - 在指定时间内多次触发只执行最后一次
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 延迟时间，单位毫秒
 * @param {Boolean} immediate 是否立即执行
 * @returns {Function} 防抖处理后的函数
 */
export function debounce(fn, delay = 300, immediate = false) {
  let timer = null;

  return function (...args) {
    // 保存this上下文
    const context = this;

    // 如果有定时器则清除
    if (timer) clearTimeout(timer);

    // 立即执行
    if (immediate) {
      // 如果已经执行过，则不再执行
      const callNow = !timer;
      timer = setTimeout(() => {
        timer = null;
      }, delay);

      if (callNow) fn.apply(context, args);
    } else {
      // 设置定时器，delay毫秒后执行
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
      }, delay);
    }
  };
}

/**
 * 节流函数 - 在指定时间内只执行一次
 * @param {Function} fn 要执行的函数
 * @param {Number} delay 间隔时间，单位毫秒
 * @returns {Function} 节流处理后的函数
 */
export function throttle(fn, delay = 300) {
  let lastTime = 0;
  let timer = null;

  return function (...args) {
    const context = this;
    const now = Date.now();

    // 计算距离上次执行的时间
    const remaining = delay - (now - lastTime);

    // 如果距离上次执行的时间大于等于设置的时间，则执行
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }

      lastTime = now;
      fn.apply(context, args);
    } else if (!timer) {
      // 设置定时器，保证最后一次也能被执行
      timer = setTimeout(() => {
        lastTime = Date.now();
        fn.apply(context, args);
        timer = null;
      }, remaining);
    }
  };
}

/**
 * 格式化文件大小
 * @param {Number} bytes 文件大小（字节）
 * @param {Number} decimals 小数位数
 * @returns {String} 格式化后的文件大小
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * 深拷贝对象
 * @param {Object} obj 要拷贝的对象
 * @returns {Object} 拷贝后的新对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // 处理Array
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }

  // 处理Object
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = deepClone(obj[key]);
    }
  }

  return result;
}

/**
 * 生成唯一ID
 * @returns {String} 唯一ID
 */
export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 休眠函数
 * @param {Number} ms 休眠时间，单位毫秒
 * @returns {Promise} Promise对象
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 检查元素是否在视口内
 * @param {HTMLElement} element 要检查的元素
 * @param {Number} offset 偏移量，默认为0
 * @returns {Boolean} 是否在视口内
 */
export function isElementInViewport(element, offset = 0) {
  const rect = element.getBoundingClientRect();

  return (
    rect.top >= 0 - offset &&
    rect.left >= 0 - offset &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
  );
}

// 从draggable.js导入拖拽函数
export { makeDraggable } from './draggable'; 