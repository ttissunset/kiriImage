<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- 页面标题和工具栏 -->
    <div class="flex-none z-10 bg-background px-4 py-2 md:px-6 lg:px-8 border-b shadow-sm">
      <div class="flex items-center justify-between">
        <h5 class="text-lg font-semibold text-card-foreground sm:text-xl">
          每日推荐
        </h5>

        <div class="flex items-center gap-2">
          <!-- 收藏按钮 -->
          <Button variant="outline" size="sm" @click="addToFavorite" class="flex items-center gap-1" :disabled="isSaving">
            <HeartIcon class="h-4 w-4" :class="isSaving ? 'animate-pulse' : ''" />
          </Button>

          <!-- 下载按钮 -->
          <Button variant="outline" size="sm" @click="downloadImage" class="flex items-center gap-1">
            <ArrowDownTrayIcon class="h-4 w-4" />
          </Button>

          <!-- 刷新按钮 -->
          <Button variant="outline" size="sm" @click="getImgUrl" class="flex items-center gap-1">
            <ArrowPathIcon class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- 图片展示区域 - 占据除头部外的所有空间 -->
    <div class="flex-1 w-full overflow-hidden">
      <img :src="imgUrl" class="w-full h-full object-cover" ref="imageRef" @load="isLoaded = true" />
    </div>

    <!-- 加载提示 -->
    <div v-if="!isLoaded" class="absolute inset-0 flex items-center justify-center bg-background/50">
      <div class="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
    </div>

    <!-- 收藏进度提示 -->
    <div v-if="isSaving" class="fixed bottom-4 left-0 right-0 mx-auto w-fit bg-background shadow-md rounded-md px-4 py-2 flex items-center gap-2">
      <div class="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"></div>
      <span class="text-sm">{{ savingMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import Button from "../components/ui/Button.vue";
import { ArrowPathIcon, HeartIcon, ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useToastStore } from "../stores/toastStore";
import { uploadImage } from "../api/images";
import { addToFavorites } from "../api/favorites";

const toastStore = useToastStore();
const imgUrl = ref('');
const isLoaded = ref(false);
const isSaving = ref(false);
const savingMessage = ref('');
const imageRef = ref(null);

// 获取图片URL
const getImgUrl = async () => {
  isLoaded.value = false;
  try {
    const res = await axios({
      method: 'get',
      url: 'https://www.loliapi.com/acg/',
      params: {
        type: 'url'
      }
    });
    imgUrl.value = res.data;
  } catch (error) {
    toastStore.error('获取图片失败，请重试');
    console.error('获取图片失败:', error);
  }
};

// 将图片添加到收藏
const addToFavorite = async () => {
  if (!imgUrl.value || isSaving.value) return;

  isSaving.value = true;
  savingMessage.value = '准备收藏...';

  try {
    savingMessage.value = '上传图片中...';

    // 从图片URL获取Blob对象
    const response = await fetch(imgUrl.value);
    const blob = await response.blob();

    // 生成文件名（使用时间戳+随机数）
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const fileName = `recommend_${timestamp}_${random}.jpg`;

    // 创建FormData对象
    const formData = new FormData();
    formData.append('file', blob, fileName);

    // 上传图片到R2
    const uploadResult = await uploadImage(formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        savingMessage.value = `上传中... ${percentCompleted}%`;
      }
    });

    savingMessage.value = '添加到收藏中...';

    // 将上传后的图片添加到收藏
    if (uploadResult && uploadResult.data && uploadResult.data.id) {
      await addToFavorites(uploadResult.data.id);
      toastStore.success('图片已添加到收藏');
    } else {
      throw new Error('上传图片成功但未返回有效ID');
    }
  } catch (error) {
    toastStore.error('收藏失败: ' + (error.message || '未知错误'));
    console.error('收藏图片失败:', error);
  } finally {
    isSaving.value = false;
  }
};

// 下载图片
const downloadImage = async () => {
  if (!imgUrl.value || !imageRef.value) return;

  try {
    toastStore.info('准备下载中...');

    // 创建canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 创建新的图片对象用于绘制到canvas
    const img = new Image();

    // 处理跨域问题
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 设置canvas大小为图片实际大小
      canvas.width = img.width;
      canvas.height = img.height;

      // 在canvas上绘制图片
      ctx.drawImage(img, 0, 0);

      // 将canvas内容转换为blob
      canvas.toBlob((blob) => {
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `recommend_image_${new Date().getTime()}.jpg`;
        document.body.appendChild(a);
        a.click();

        // 清理
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

        toastStore.success('图片已保存');
      }, 'image/jpeg', 0.95); // 图片质量设为95%
    };

    // 设置错误处理
    img.onerror = () => {
      toastStore.error('图片下载失败，可能是跨域限制导致');

      // 尝试使用原始下载方法作为备选
      const a = document.createElement('a');
      a.href = imgUrl.value;
      a.download = `recommend_image_${new Date().getTime()}.jpg`;
      a.target = '_blank'; // 新窗口打开
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // 加载图片
    img.src = imgUrl.value;
  } catch (error) {
    toastStore.error('下载失败，请重试');
    console.error('下载图片失败:', error);
  }
};

// 页面加载时获取图片URL
onMounted(async () => {
  await getImgUrl();
});
</script>

<style scoped>
/* 安全区适配 */
@supports (padding: max(0px)) {
  .px-4 {
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
  }
}
</style> 