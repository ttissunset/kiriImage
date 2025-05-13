// 性能优化工具

/**
 * 防抖函数
 * @param {Function} fn 需要防抖的函数
 * @param {Number} delay 延迟时间(ms)
 * @returns {Function} 防抖处理后的函数
 */
export const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 * @param {Function} fn 需要节流的函数
 * @param {Number} limit 时间限制(ms)
 * @returns {Function} 节流处理后的函数
 */
export const throttle = (fn, limit = 300) => {
  let waiting = false;
  return function (...args) {
    if (!waiting) {
      fn.apply(this, args);
      waiting = true;
      setTimeout(() => {
        waiting = false;
      }, limit);
    }
  };
};

/**
 * 预加载图片
 * @param {Array} imgList 图片URL数组
 * @returns {Promise} Promise对象
 */
export const preloadImages = (imgList) => {
  const promises = imgList.map(src => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  });
  return Promise.all(promises);
};

/**
 * 缓存函数结果
 * @param {Function} fn 需要缓存结果的函数
 * @returns {Function} 缓存处理后的函数
 */
export const memoize = (fn) => {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);

    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
};

/**
 * 虚拟列表实现 - 用于处理大量数据展示
 * @param {Array} items 完整数据列表
 * @param {Number} visibleItemsCount 可见项数量
 * @param {Number} itemHeight 每项高度
 * @returns {Object} 虚拟列表控制对象
 */
export const createVirtualList = (items, visibleItemsCount, itemHeight) => {
  let startIndex = 0;

  const getVisibleItems = () => {
    return items.slice(startIndex, startIndex + visibleItemsCount);
  };

  const getTransform = () => {
    return `translateY(${startIndex * itemHeight}px)`;
  };

  const getTotalHeight = () => {
    return items.length * itemHeight;
  };

  const scrollToIndex = (index) => {
    startIndex = Math.max(0, Math.min(items.length - visibleItemsCount, index));
    return {
      visibleItems: getVisibleItems(),
      transform: getTransform()
    };
  };

  const onScroll = (scrollTop) => {
    const newStartIndex = Math.floor(scrollTop / itemHeight);
    if (newStartIndex !== startIndex) {
      startIndex = newStartIndex;
      return {
        visibleItems: getVisibleItems(),
        transform: getTransform()
      };
    }
    return null;
  };

  return {
    getVisibleItems,
    getTransform,
    getTotalHeight,
    scrollToIndex,
    onScroll
  };
}; 