// 图片处理工具
import { memoize } from './performance';

/**
 * 获取图片的主色调
 * @param {string} imageUrl 图片URL
 * @returns {Promise<string>} 主色调的十六进制值
 */
export const getImageDominantColor = (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      // 创建Canvas用于获取图片数据
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const width = img.width;
      const height = img.height;

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      // 获取图片数据
      const imageData = ctx.getImageData(0, 0, width, height).data;

      // 分析图片颜色
      const colorMap = {};
      let maxCount = 0;
      let dominantColor = '#FFFFFF'; // 默认白色

      // 每隔10个像素采样一次，提高性能
      for (let i = 0; i < imageData.length; i += 40) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];

        // 将RGB合并为简化的颜色键
        // 将颜色值量化，减少颜色数量
        const quantizedR = Math.round(r / 32) * 32;
        const quantizedG = Math.round(g / 32) * 32;
        const quantizedB = Math.round(b / 32) * 32;

        const colorKey = `${quantizedR},${quantizedG},${quantizedB}`;

        colorMap[colorKey] = (colorMap[colorKey] || 0) + 1;

        if (colorMap[colorKey] > maxCount) {
          maxCount = colorMap[colorKey];
          dominantColor = `#${quantizedR.toString(16).padStart(2, '0')}${quantizedG.toString(16).padStart(2, '0')}${quantizedB.toString(16).padStart(2, '0')}`;
        }
      }

      resolve(dominantColor);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for color analysis'));
    };

    img.src = imageUrl;
  });
};

// 使用memoize缓存结果，避免重复计算
export const getCachedImageDominantColor = memoize(getImageDominantColor);

/**
 * 检查图片是否为暗色调
 * @param {string} hexColor 十六进制颜色值
 * @returns {boolean} 如果图片是暗色调则返回true
 */
export const isDarkColor = (hexColor) => {
  // 移除#前缀
  const hex = hexColor.replace('#', '');

  // 转换为RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 计算亮度 (基于人眼对不同颜色的感知)
  // 参考: https://www.w3.org/TR/AERT/#color-contrast
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // 亮度小于128被认为是暗色
  return brightness < 128;
};

/**
 * 调整图片大小
 * @param {File} file 图片文件
 * @param {number} maxWidth 最大宽度
 * @param {number} maxHeight 最大高度
 * @param {number} quality 压缩质量 (0-1)
 * @returns {Promise<Blob>} 调整大小后的图片Blob
 */
export const resizeImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // 创建FileReader读取文件
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // 获取原始尺寸
        let width = img.width;
        let height = img.height;

        // 计算新尺寸，保持比例
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // 创建Canvas进行绘制
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // 转换为Blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, file.type, quality);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for resizing'));
      };

      img.src = readerEvent.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
};

// 使用memoize缓存调整大小函数（针对相同的尺寸和质量参数）
export const getCachedImageSize = memoize((imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image for size detection'));
    };
    img.src = imageUrl;
  });
}); 