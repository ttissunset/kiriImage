/**
 * 使元素可拖拽的工具函数
 * @param {HTMLElement} element - 需要拖拽的元素
 * @param {HTMLElement} handle - 拖拽的触发区域，如果不提供则使用元素本身
 * @param {Object} options - 配置选项
 * @param {boolean} options.constrainToWindow - 是否限制元素在窗口内，默认为true
 * @param {number} options.marginX - X轴方向的边距，默认为0
 * @param {number} options.marginY - Y轴方向的边距，默认为0
 * @param {Function} options.onDragStart - 拖拽开始时的回调函数
 * @param {Function} options.onDragEnd - 拖拽结束时的回调函数
 * @returns {Object} 包含destroy方法的对象，用于移除拖拽功能
 */
export function makeDraggable(element, handle = null, options = {}) {
  // 默认选项
  const settings = {
    constrainToWindow: true,
    marginX: 0,
    marginY: 0,
    onDragStart: null,
    onDragEnd: null,
    ...options
  };

  // 拖拽的触发区域
  const dragHandle = handle || element;

  // 状态变量
  let isDragging = false;
  let initialX = 0;
  let initialY = 0;
  let currentX = 0;
  let currentY = 0;
  let offsetX = 0;
  let offsetY = 0;

  // 设置初始样式
  if (!element.style.position || element.style.position === 'static') {
    element.style.position = 'absolute';
  }

  // 拖拽开始处理
  const dragStart = (e) => {
    e.preventDefault();

    // 检查是否点击在按钮或其他可交互元素上
    if (e.target.closest('button') || e.target.closest('a') ||
      e.target.closest('input') || e.target.closest('select') ||
      e.target.closest('textarea')) {
      return;
    }

    if (e.type === 'touchstart') {
      initialX = e.touches[0].clientX;
      initialY = e.touches[0].clientY;
    } else {
      initialX = e.clientX;
      initialY = e.clientY;
    }

    // 获取当前元素位置
    const rect = element.getBoundingClientRect();
    currentX = rect.left;
    currentY = rect.top;

    // 设置为正在拖拽
    isDragging = true;

    // 添加移动和结束事件监听器
    if (e.type === 'touchstart') {
      document.addEventListener('touchmove', drag, { passive: false });
      document.addEventListener('touchend', dragEnd);
    } else {
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);
    }

    // 调用拖拽开始回调
    if (typeof settings.onDragStart === 'function') {
      settings.onDragStart(element, { x: currentX, y: currentY });
    }

    // 设置拖拽中的样式
    element.style.transition = 'none';
    dragHandle.style.cursor = 'grabbing';
  };

  // 拖拽过程处理
  const drag = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    let eventX, eventY;
    if (e.type === 'touchmove') {
      eventX = e.touches[0].clientX;
      eventY = e.touches[0].clientY;
    } else {
      eventX = e.clientX;
      eventY = e.clientY;
    }

    // 计算新位置
    offsetX = eventX - initialX;
    offsetY = eventY - initialY;

    let newX = currentX + offsetX;
    let newY = currentY + offsetY;

    // 限制在窗口内
    if (settings.constrainToWindow) {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const elementWidth = element.offsetWidth;
      const elementHeight = element.offsetHeight;

      const minX = settings.marginX;
      const maxX = windowWidth - elementWidth - settings.marginX;
      const minY = settings.marginY;
      const maxY = windowHeight - elementHeight - settings.marginY;

      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
    }

    // 应用新位置
    element.style.left = `${newX}px`;
    element.style.top = `${newY}px`;
  };

  // 拖拽结束处理
  const dragEnd = () => {
    isDragging = false;

    // 移除事件监听器
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', dragEnd);

    // 恢复样式
    element.style.transition = '';
    dragHandle.style.cursor = '';

    // 调用拖拽结束回调
    if (typeof settings.onDragEnd === 'function') {
      settings.onDragEnd(element, { x: parseInt(element.style.left), y: parseInt(element.style.top) });
    }
  };

  // 添加事件监听器
  dragHandle.addEventListener('mousedown', dragStart);
  dragHandle.addEventListener('touchstart', dragStart, { passive: false });

  // 设置拖拽手柄样式
  dragHandle.style.cursor = 'grab';
  dragHandle.style.userSelect = 'none';

  // 返回清理函数
  return {
    destroy: () => {
      dragHandle.removeEventListener('mousedown', dragStart);
      dragHandle.removeEventListener('touchstart', dragStart);
      document.removeEventListener('mousemove', drag);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchmove', drag);
      document.removeEventListener('touchend', dragEnd);

      // 恢复样式
      dragHandle.style.cursor = '';
      dragHandle.style.userSelect = '';
    }
  };
} 