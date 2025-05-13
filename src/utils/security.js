// 安全防护工具 - 生产环境启用

// 禁止选中内容
export const disableContentSelection = () => {
  if (process.env.NODE_ENV === 'production') {
    // 添加全局样式
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      /* 输入框、文本域等允许选中 */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }
    `;
    document.head.appendChild(style);

    // 禁止右键菜单
    document.addEventListener('contextmenu', (e) => {
      if (!e.target.closest('input, textarea, [contenteditable="true"]')) {
        e.preventDefault();
        return false;
      }
    });
  }
};

// 禁止打开控制台
export const disableDevTools = () => {
  if (process.env.NODE_ENV === 'production') {
    // 方法1: 检测开发者工具打开状态
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;

      if (widthThreshold || heightThreshold) {
        // 重定向或显示警告
        document.body.innerHTML = '<div style="text-align:center;margin-top:40vh;font-size:24px;">禁止使用开发者工具查看本站</div>';
      }
    };

    // 方法2: 监听键盘快捷键
    document.addEventListener('keydown', (e) => {
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12
      if (
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        e.keyCode === 123
      ) {
        e.preventDefault();
        return false;
      }
    });

    // 定期检查
    setInterval(checkDevTools, 1000);
    window.addEventListener('resize', checkDevTools);
  }
};

// 优化图片懒加载
export const setupImageLazyLoading = () => {
  // 使用IntersectionObserver实现懒加载
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.setAttribute('src', src);
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    // 为所有data-src的图片添加观察
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// 初始化所有安全措施
export const initSecurityMeasures = () => {
  disableContentSelection();
  disableDevTools();
  setupImageLazyLoading();
}; 