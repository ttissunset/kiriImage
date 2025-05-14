<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- 页面标题和工具栏 -->
    <div
      class="flex-none z-10 bg-background px-4 py-2 md:px-6 lg:px-8 border-b shadow-sm"
    >
      <div class="flex items-center justify-between">
        <h5 class="text-lg font-semibold text-card-foreground sm:text-xl">
          随机推荐
        </h5>

        <div class="flex items-center gap-2">
          <!-- 图片源选择下拉框 -->
          <div class="hidden sm:block">
            <Select
              v-model="selectedSource"
              :options="imageSources"
              @update:modelValue="changeImageSource"
              class="w-32 text-xs"
            />
          </div>

          <!-- 收藏按钮 -->
          <Button
            variant="ghost"
            size="sm"
            @click="addToFavorite"
            class="flex items-center gap-1"
            :disabled="isSaving"
          >
            <HeartIcon
              class="h-4 w-4"
              :class="isSaving ? 'animate-pulse' : ''"
            />
          </Button>

          <!-- 下载按钮 -->
          <Button
            variant="ghost"
            size="sm"
            @click="downloadImage"
            class="flex items-center gap-1"
          >
            <ArrowDownTrayIcon class="h-4 w-4" />
          </Button>

          <!-- 刷新按钮 -->
          <Button
            variant="ghost"
            size="sm"
            @click="getImgUrl"
            class="flex items-center gap-1"
          >
            <ArrowPathIcon class="h-4 w-4" />
          </Button>

          <!-- 移动端菜单按钮 - 只在移动端显示 -->
          <Button
            variant="ghost"
            size="sm"
            @click="toggleMobileMenu"
            class="flex md:hidden items-center gap-1 ml-1"
          >
            <Bars3Icon class="h-4 w-4" />
          </Button>
        </div>
      </div>

      <!-- 移动端下拉框 -->
      <div class="sm:hidden mt-2">
        <Select
          v-model="selectedSource"
          :options="imageSources"
          @update:modelValue="changeImageSource"
          placeholder="选择图片源"
        />
      </div>
    </div>

    <!-- 图片/视频展示区域 - 占据除头部外的所有空间 -->
    <div class="flex-1 w-full h-full relative bg-black overflow-hidden">
      <!-- 背景模糊层 - 铺满整个区域 -->
      <div
        v-if="imgUrl && isLoaded && !isVideo"
        class="absolute inset-0 bg-center bg-no-repeat bg-cover filter blur-md opacity-80 scale-110"
        :style="{ backgroundImage: `url(${imgUrl})` }"
      ></div>

      <!-- 主图片容器 - 居中显示完整图片 -->
      <div class="absolute inset-0 flex items-center justify-center">
        <!-- 图片显示 -->
        <img
          v-if="imgUrl && !isVideo"
          :src="imgUrl"
          class="max-w-full max-h-full object-contain"
          ref="imageRef"
          @load="isLoaded = true"
        />
        
        <!-- 视频播放器 -->
        <video
          v-if="isVideo && imgUrl"
          ref="videoRef"
          :src="imgUrl"
          class="w-full h-full object-contain"
          autoplay
          loop
          muted
          controls
          @loadeddata="isLoaded = true"
          @error="handleVideoError"
        ></video>
    </div>

    <!-- 加载提示 -->
      <div
        v-if="!isLoaded"
        class="absolute inset-0 flex items-center justify-center bg-black/50 z-10"
      >
        <div
          class="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"
        ></div>
      </div>
    </div>

    <!-- 收藏进度提示 -->
    <div
      v-if="isSaving"
      class="fixed bottom-4 left-0 right-0 mx-auto w-fit bg-background shadow-md rounded-md px-4 py-2 flex items-center gap-2"
    >
      <div
        class="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary"
      ></div>
      <span class="text-sm">{{ savingMessage }}</span>
    </div>
  </div>
</template>

<script setup>
import Button from "../components/ui/Button.vue";
import Select from "../components/ui/Select.vue";
import {
  ArrowPathIcon,
  HeartIcon,
  ArrowDownTrayIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";
import axios from "axios";
import { onMounted, ref } from "vue";
import { useToastStore } from "../stores/toastStore";
import { uploadImage } from "../api/images";
import { addToFavorites } from "../api/favorites";

const toastStore = useToastStore();
const imgUrl = ref("");
const isLoaded = ref(false);
const isSaving = ref(false);
const savingMessage = ref("");
const imageRef = ref(null);
const videoRef = ref(null);
const isVideo = ref(false); // 标记当前内容是否是视频

// 图片源配置
const imageSources = [
  { value: "loli", label: "LoliAPI" },
  { value: "dmoe", label: "demo" },
  { value: "likepoems", label: "如诗" },
  { value: "pixiv", label: "pixiv" },
  { value: "alcy", label: "alcy" },
  { value: "acg", label: "acg" },
];

// 当前选择的图片源
const selectedSource = ref("loli");

// 根据图片源获取不同的URL
const getImageUrlBySource = async (source) => {
  isLoaded.value = false;
  isVideo.value = false; // 默认重置为图片模式
  
  try {
    let url = "";
    // 添加时间戳和随机数，确保每次请求都是唯一的
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    const cacheBuster = `?t=${timestamp}&r=${randomNum}`;
    
    switch (source) {
      case "loli":
        const loliRes = await axios({
          method: "get",
          url: "https://www.loliapi.com/acg/",
          params: { type: "url" },
        });
        url = loliRes.data;
        break;

      case "dmoe":
        url = `https://www.dmoe.cc/random.php${cacheBuster}`;
        break;

      case "如诗":
        url = `https://img.likepoems.com/images/pc${cacheBuster}`;
        break;
        // Unsplash随机图片
        url = `https://source.unsplash.com/random${cacheBuster}`;
        break;

      case "pixiv":
        url = `https://api.likepoems.com/img/pixiv/${cacheBuster}`;
        break;

      case "alcy":
        // 添加随机参数避免缓存
        url = `https://t.alcy.cc/ycy${cacheBuster}`;
        break;

      case "acg":
        // 添加随机参数避免缓存
        url = `https://t.alcy.cc/acg${cacheBuster}`;
        isVideo.value = true; // 标记为视频模式
        break;

      default:
        // 默认使用LoliAPI
        const defaultRes = await axios({
          method: "get",
          url: "https://www.loliapi.com/acg/",
          params: { type: "url" },
        });
        url = defaultRes.data;
    }

    imgUrl.value = url;
    
    // 如果30秒后仍未加载完成，强制重置加载状态
    const loadingTimeout = setTimeout(() => {
      if (!isLoaded.value) {
        isLoaded.value = true;
        toastStore.error("内容加载超时，请重试");
        console.warn("Content loading timeout for source:", source);
      }
    }, 30000);
    
    // 清理函数
    return () => clearTimeout(loadingTimeout);
  } catch (error) {
    isLoaded.value = true; // 出错时也要重置加载状态
    toastStore.error(
      `获取${imageSources.find((s) => s.value === source)?.label || "图片"}失败，请重试`
    );
    console.error("获取图片失败:", error);
  }
};

// 切换图片源
const changeImageSource = () => {
  getImageUrlBySource(selectedSource.value);
};

// 获取图片URL
const getImgUrl = async () => {
  await getImageUrlBySource(selectedSource.value);
};

// 将图片添加到收藏
const addToFavorite = async () => {
  if (!imgUrl.value || isSaving.value) return;

  isSaving.value = true;
  savingMessage.value = "准备收藏...";

  try {
    savingMessage.value = "上传图片中...";

    // 获取图片扩展名
    let extension = "jpg"; // 默认jpg格式
    const urlParts = imgUrl.value.split("?")[0].split(".");
    if (urlParts.length > 1) {
      const lastPart = urlParts[urlParts.length - 1].toLowerCase();
      if (["jpg", "jpeg", "png", "gif", "webp"].includes(lastPart)) {
        extension = lastPart;
      }
    }

    // 生成文件名（使用时间戳+随机数）
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    const source = selectedSource.value;
    const fileName = `${source}_${timestamp}_${random}.${extension}`;

    let blob;

    try {
      // 直接fetch可能会有跨域问题，我们尝试使用canvas方法
      savingMessage.value = "处理图片中...";

      // 创建一个隐藏的图片元素
      const img = new Image();
      img.crossOrigin = "anonymous";

      // 使用Promise等待图片加载
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;

        // 为URL添加时间戳避免缓存
        const cacheBuster = imgUrl.value.includes("?") ? "&t=" : "?t=";
        img.src = imgUrl.value + cacheBuster + Date.now();
      });

      // 创建canvas并将图片绘制到canvas
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      // 将canvas转换为blob
      blob = await new Promise((resolve) => {
        canvas.toBlob(
          resolve,
          `image/${extension === "jpg" ? "jpeg" : extension}`,
          0.95
        );
      });
    } catch (canvasError) {
      console.warn("Canvas方法获取图片失败，尝试直接fetch:", canvasError);

      // 如果canvas方法失败，尝试直接fetch
      savingMessage.value = "尝试直接获取图片...";
      try {
        const response = await fetch(imgUrl.value, {
          headers: {
            Origin: window.location.origin,
          },
          mode: "cors",
        });
        blob = await response.blob();
      } catch (fetchError) {
        console.error("直接fetch图片失败:", fetchError);
        throw new Error("无法获取图片内容，可能是由于跨域限制");
      }
    }

    if (!blob) {
      throw new Error("无法获取图片内容");
    }

    // 创建FormData对象
    const formData = new FormData();
    formData.append("file", blob, fileName);

    // 上传图片到服务器
    savingMessage.value = "上传到服务器...";
    const uploadResult = await uploadImage(formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        savingMessage.value = `上传中... ${percentCompleted}%`;
      },
    });

    savingMessage.value = "添加到收藏中...";

    // 将上传后的图片添加到收藏
    if (uploadResult && uploadResult.data && uploadResult.data.id) {
      await addToFavorites(uploadResult.data.id);
      toastStore.success("图片已添加到收藏");
    } else {
      throw new Error("上传图片成功但未返回有效ID");
    }
  } catch (error) {
    toastStore.error("收藏失败: " + (error.message || "未知错误"));
    console.error("收藏图片失败:", error);
  } finally {
    isSaving.value = false;
  }
};

// 下载图片
const downloadImage = async () => {
  if (!imgUrl.value || !imageRef.value) return;

  try {
    toastStore.info("准备下载中...");

    // 创建canvas元素
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // 创建新的图片对象用于绘制到canvas
    const img = new Image();

    // 处理跨域问题
    img.crossOrigin = "anonymous";

    img.onload = () => {
      // 设置canvas大小为图片实际大小
      canvas.width = img.width;
      canvas.height = img.height;

      // 在canvas上绘制图片
      ctx.drawImage(img, 0, 0);

      // 将canvas内容转换为blob
      canvas.toBlob(
        (blob) => {
        // 创建下载链接
        const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
        a.href = url;
        a.download = `recommend_image_${new Date().getTime()}.jpg`;
        document.body.appendChild(a);
        a.click();

        // 清理
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);

          toastStore.success("图片已保存");
        },
        "image/jpeg",
        0.95
      ); // 图片质量设为95%
    };

    // 设置错误处理
    img.onerror = () => {
      toastStore.error("图片下载失败，可能是跨域限制导致");

      // 尝试使用原始下载方法作为备选
      const a = document.createElement("a");
      a.href = imgUrl.value;
      a.download = `recommend_image_${new Date().getTime()}.jpg`;
      a.target = "_blank"; // 新窗口打开
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    // 加载图片
    img.src = imgUrl.value;
  } catch (error) {
    toastStore.error("下载失败，请重试");
    console.error("下载图片失败:", error);
  }
};

// 移动端菜单控制
const toggleMobileMenu = () => {
  // 触发App组件中的toggleMobileMenu方法
  document.dispatchEvent(new CustomEvent("toggle-mobile-menu"));
};

// 视频错误处理
const handleVideoError = () => {
  isLoaded.value = true;
  toastStore.error("视频加载失败，请重试");
};

// 页面加载时获取图片URL
onMounted(async () => {
  await getImgUrl();
  // const alcyRes = await axios({
  //   method: "get",
  //   url: "https://t.alcy.cc/ycy?json",
  // });
  // console.log(alcyRes);
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
