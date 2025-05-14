<template>
  <div v-if="modelValue" class="fixed inset-0 z-[9999] flex items-center justify-center">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-black/50" @click="isEditing ? null : cancel"></div>

    <!-- 对话框 -->
    <div ref="dialogRef" class="relative w-full max-w-md rounded-lg bg-card p-6 shadow-lg z-[10000]">
      <!-- 标题栏作为拖拽手柄 -->
      <h2 ref="dialogHeaderRef" class="mb-4 text-xl font-semibold flex justify-between items-center draggable-handle">
        <span>个人信息</span>
        <button v-if="!isEditing" @click="startEditing" class="text-sm font-normal flex items-center text-primary">
          <PencilIcon class="h-4 w-4 mr-1" />
          编辑
        </button>
      </h2>

      <!-- 头像和用户信息 -->
      <div class="flex items-center space-x-4 mb-6">
        <!-- 普通模式显示头像 -->
        <div v-if="!isEditing" class="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center">
          <img v-if="user && user.avatar" :src="user.avatar" :key="user.avatar" alt="用户头像" class="h-full w-full object-cover" />
          <UserIcon v-else class="h-8 w-8 text-muted-foreground" />
        </div>

        <!-- 编辑模式的头像上传区域 -->
        <div v-else class="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center relative">
          <input type="file" ref="avatarInput" class="hidden" accept="image/*" @change="handleAvatarChange" />

          <!-- 上传进度显示 -->
          <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
            <div class="w-full h-full relative">
              <!-- 环形进度条 -->
              <svg class="absolute inset-0" viewBox="0 0 36 36">
                <circle stroke="rgba(255,255,255,0.2)" fill="transparent" stroke-width="3" r="16" cx="18" cy="18" />
                <circle stroke="rgba(255,255,255,0.9)" fill="transparent" stroke-width="3" stroke-dasharray="100" :stroke-dashoffset="100 - uploadProgress" stroke-linecap="round" r="16" cx="18" cy="18" class="transform -rotate-90 origin-center" />
              </svg>
              <!-- 进度文本 -->
              <div class="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                {{ Math.round(uploadProgress) }}%
              </div>
            </div>
          </div>

          <img v-if="avatarPreview || (user && user.avatar)" :src="avatarPreview || user.avatar" :key="avatarPreview || (user && user.avatar) || 'no-avatar'" alt="用户头像" class="h-full w-full object-cover" />
          <UserIcon v-else class="h-8 w-8 text-muted-foreground" />

          <!-- 上传按钮覆盖在头像上 -->
          <div v-if="!isUploading" class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" @click="openAvatarOptions">
            <ArrowUpTrayIcon class="h-6 w-6 text-white" />
          </div>
        </div>

        <!-- 普通模式显示用户信息 -->
        <div v-if="!isEditing">
          <h3 class="text-lg font-medium">{{ user ? user.nickname || user.username : '未登录' }}</h3>
          <p class="text-sm text-muted-foreground">{{ user ? user.email : '' }}</p>
        </div>

        <!-- 编辑模式的昵称输入框 -->
        <div v-else class="flex-1">
          <input v-model="editNickname" type="text" class="w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder="请输入昵称" />
        </div>
      </div>

      <!-- 账户信息 -->
      <div class="space-y-4">
        <div class="border rounded-md p-4">
          <h4 class="text-sm font-medium mb-2">账户信息</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">用户名</span>
              <span class="text-sm">{{ user ? user.username : '未登录' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">用户ID</span>
              <span class="text-sm">{{ user ? user.id : '未知' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">注册时间</span>
              <span class="text-sm">{{ user && user.createdAt ? formatDate(user.createdAt) : '未知' }}</span>
            </div>
          </div>
        </div>

        <!-- 使用统计 -->
        <div class="border rounded-md p-4">
          <h4 class="text-sm font-medium mb-2">使用统计</h4>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">上传图片</span>
              <span class="text-sm">{{ stats.uploadCount }} 张</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">收藏图片</span>
              <span class="text-sm">{{ stats.favoriteCount }} 张</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-muted-foreground">存储空间</span>
              <span class="text-sm">{{ formatStorage(stats.storageUsed) }} / {{ formatStorage(stats.storageLimit) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 按钮区域 -->
      <div class="flex justify-end space-x-2 mt-6">
        <!-- 普通模式按钮 -->
        <template v-if="!isEditing">
          <button @click="cancel" class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">
            关闭
          </button>
          <button @click="logout" class="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90">
            退出登录
          </button>
        </template>

        <!-- 编辑模式按钮 -->
        <template v-else>
          <button @click="cancelEditing" class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">
            取消
          </button>
          <button @click="saveUserInfo" class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90" :disabled="isSubmitting">
            <span v-if="!isSubmitting">保存</span>
            <span v-else>保存中...</span>
          </button>
        </template>
      </div>
    </div>
  </div>

  <!-- 添加头像选择对话框 -->
  <div v-if="showAvatarOptions" class="fixed inset-0 z-[10001] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="showAvatarOptions = false"></div>
    <div class="relative w-full max-w-sm rounded-lg bg-card p-4 shadow-lg">
      <h3 class="text-lg font-medium mb-4">选择头像</h3>
      <div class="grid grid-cols-2 gap-4">
        <button 
          @click="$refs.avatarInput.click(); showAvatarOptions = false"
          class="flex flex-col items-center justify-center rounded-md border p-4 hover:bg-muted transition-colors"
        >
          <ArrowUpTrayIcon class="h-8 w-8 mb-2 text-primary" />
          <span class="text-sm">从本地上传</span>
        </button>
        <button 
          @click="showGalleryPicker = true; showAvatarOptions = false"
          class="flex flex-col items-center justify-center rounded-md border p-4 hover:bg-muted transition-colors"
        >
          <PhotoIcon class="h-8 w-8 mb-2 text-primary" />
          <span class="text-sm">从相册选择</span>
        </button>
      </div>
    </div>
  </div>

  <!-- 相册图片选择对话框 -->
  <div v-if="showGalleryPicker" class="fixed inset-0 z-[10001] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="showGalleryPicker = false"></div>
    <div class="relative w-full max-w-4xl h-[70vh] rounded-lg bg-card p-4 shadow-lg flex flex-col">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">从相册选择头像</h3>
        <button @click="showGalleryPicker = false" class="text-muted-foreground hover:text-foreground">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
      
      <div v-if="isLoading" class="flex-1 flex items-center justify-center">
        <div class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
      
      <div v-else-if="filteredGalleryImages.length === 0" class="flex-1 flex items-center justify-center text-muted-foreground">
        相册中没有可用的图片
      </div>
      
      <div v-else class="flex-1 overflow-y-auto p-2">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div 
            v-for="image in filteredGalleryImages" 
            :key="image.id" 
            class="aspect-square rounded-md overflow-hidden cursor-pointer border border-muted hover:ring-2 hover:ring-primary relative"
            @click="previewImage(image)"
          >
            <img :src="image.thumbUrl || image.url" :alt="image.name" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button @click="showGalleryPicker = false" class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80">
          取消
        </button>
      </div>
    </div>
  </div>

  <!-- 图片预览弹窗 -->
  <div v-if="showImagePreview" class="fixed inset-0 z-[10002] flex items-center justify-center">
    <div class="absolute inset-0 bg-black/70" @click="showImagePreview = false"></div>
    <div class="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
      <!-- 关闭按钮 -->
      <button 
        @click="showImagePreview = false" 
        class="absolute top-2 right-2 z-10 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
      
      <!-- 图片 -->
      <div class="relative overflow-hidden rounded-lg">
        <img 
          :src="previewingImage?.url" 
          :alt="previewingImage?.name" 
          class="max-h-[80vh] max-w-full object-contain"
        />
      </div>
      
      <!-- 操作按钮 -->
      <div class="mt-4 flex space-x-3">
        <button 
          @click="selectImageAsAvatar(previewingImage); showImagePreview = false" 
          class="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          选择为头像
        </button>
        <button 
          @click="showImagePreview = false" 
          class="rounded-md bg-muted px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted/80"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UserIcon, PencilIcon, ArrowUpTrayIcon, XMarkIcon, PhotoIcon } from '@heroicons/vue/24/outline';
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useGalleryStore } from '../stores/galleryStore';
import { useFavoriteStore } from '../stores/favoriteStore';
import { useToastStore } from '../stores/toastStore';
import { updateUserInfo } from '../api/user';
import { uploadImage } from '../api/images';
import { makeDraggable } from '../utils';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  }
});

const emit = defineEmits(['update:modelValue']);
const authStore = useAuthStore();
const galleryStore = useGalleryStore();
const favoriteStore = useFavoriteStore();
const toastStore = useToastStore();

// DOM引用
const dialogRef = ref(null);
const dialogHeaderRef = ref(null);

// 拖拽控制
let draggableInstance = null;

// 销毁拖拽功能
const destroyDraggable = () => {
  if (draggableInstance) {
    draggableInstance.destroy();
    draggableInstance = null;
  }
};

// 居中对话框
const centerDialog = () => {
  if (dialogRef.value) {
    const dialog = dialogRef.value;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const dialogWidth = dialog.offsetWidth;
    const dialogHeight = dialog.offsetHeight;

    // 计算居中位置
    const left = Math.max(0, (windowWidth - dialogWidth) / 2);
    const top = Math.max(0, (windowHeight - dialogHeight) / 2);

    // 设置对话框位置
    dialog.style.position = 'absolute';
    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;
    dialog.style.margin = '0';
    dialog.style.transform = 'none';
  }
};

// 初始化拖拽功能
const initDraggable = () => {
  if (dialogRef.value && dialogHeaderRef.value) {
    // 对话框首次打开时居中显示
    centerDialog();

    // 使用makeDraggable函数使对话框可拖拽
    draggableInstance = makeDraggable(dialogRef.value, dialogHeaderRef.value, {
      constrainToWindow: true,
      marginX: 10,
      marginY: 10,
      onDragStart: () => {
        // 开始拖拽时添加样式
        dialogHeaderRef.value.classList.add('dragging');
      },
      onDragEnd: () => {
        // 结束拖拽时移除样式
        dialogHeaderRef.value.classList.remove('dragging');
      }
    });
  }
};

// 在对话框显示时初始化拖拽
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    // 对话框显示时，初始化拖拽功能
    nextTick(() => {
      initDraggable();
    });
  } else {
    // 对话框关闭时，清理拖拽功能
    destroyDraggable();
  }
}, { immediate: true });

// 组件卸载时清理
onUnmounted(() => {
  destroyDraggable();
});

const user = computed(() => authStore.user);

// 编辑状态控制
const isEditing = ref(false);
const isSubmitting = ref(false);
const editNickname = ref('');
const avatarInput = ref(null);
const avatarFile = ref(null);
const avatarPreview = ref('');

// 上传进度相关
const isUploading = ref(false);
const uploadProgress = ref(0);

// 用户统计数据
const stats = ref({
  uploadCount: 0,
  favoriteCount: 0,
  storageUsed: 0,
  storageLimit: 1024 * 1024 * 1024 * 10 // 10GB
});

// 初始化统计数据
const initStats = async () => {
  // 从galleryStore获取准确的图片数量
  await galleryStore.fetchImages();
  stats.value.uploadCount = galleryStore.total || 0;

  // 从favoriteStore获取准确的收藏数量
  await favoriteStore.fetchFavorites();
  stats.value.favoriteCount = favoriteStore.total || 0;

  // 存储空间使用量从用户数据的storage对象中获取
  if (user.value && user.value.storage) {
    // 更新获取存储空间的逻辑，使用 used 字段
    stats.value.storageUsed = user.value.storage.used || 0;
    // 如果 totalHuman 可用，则使用它来显示更友好的格式
    stats.value.storageLimit = user.value.storage.limit || stats.value.storageLimit;
  }
};

// 监听用户信息变化，更新编辑表单
watch(() => user.value, (newUser) => {
  if (newUser) {
    editNickname.value = newUser.nickname || newUser.username || '';
    // 当用户信息更新时，也更新统计数据
    initStats();
  }
}, { immediate: true });

// 开始编辑
const startEditing = () => {
  isEditing.value = true;
  if (user.value) {
    editNickname.value = user.value.nickname || user.value.username || '';
  }
  avatarPreview.value = '';
  avatarFile.value = null;
};

// 头像选择相关
const showAvatarOptions = ref(false);
const showGalleryPicker = ref(false);
const galleryImages = ref([]);
const isLoading = ref(false);

// 图片预览相关
const showImagePreview = ref(false);
const previewingImage = ref(null);

// 打开头像选择选项
const openAvatarOptions = () => {
  showAvatarOptions.value = true;
};

// 计算属性：过滤后的相册图片（只包含图片文件，不包含视频）
const filteredGalleryImages = computed(() => {
  return galleryImages.value.filter(image => {
    // 检查是否为图片类型（通过文件名后缀或MIME类型）
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const isImage = image.type?.startsWith('image/') || 
                   imageExtensions.some(ext => 
                     (image.name || '').toLowerCase().endsWith(ext) || 
                     (image.url || '').toLowerCase().endsWith(ext)
                   );
    
    return isImage;
  });
});

// 从相册加载图片
const loadGalleryImages = async () => {
  isLoading.value = true;
  try {
    // 确保相册图片已加载
    if (galleryStore.images.length === 0) {
      await galleryStore.fetchImages();
    }
    galleryImages.value = galleryStore.images;
  } catch (error) {
    console.error('加载相册图片失败:', error);
    toastStore.error('加载相册图片失败');
  } finally {
    isLoading.value = false;
  }
};

// 监听相册选择器显示状态
watch(() => showGalleryPicker.value, (newVal) => {
  if (newVal) {
    loadGalleryImages();
  }
});

// 预览图片
const previewImage = (image) => {
  previewingImage.value = image;
  showImagePreview.value = true;
};

// 选择相册图片作为头像
const selectImageAsAvatar = (image) => {
  if (!image) return;
  
  // 直接使用图片URL作为头像预览
  avatarPreview.value = image.url;
  // 标记这是从相册选择的图片，不需要重新上传
  avatarFile.value = null;
  // 存储选中图片的URL
  selectedGalleryImageUrl.value = image.url;
  // 关闭相册选择器
  showGalleryPicker.value = false;
};

// 存储从相册选择的图片URL
const selectedGalleryImageUrl = ref('');

// 保存用户信息修改，处理从相册选择的头像
const saveUserInfo = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  let avatarUrl = user.value?.avatar || '';

  try {
    // 如果有新上传的头像文件，先上传头像获取URL
    if (avatarFile.value) {
      // 开始上传
      isUploading.value = true;
      uploadProgress.value = 0;

      // 创建FormData对象上传头像
      const formData = new FormData();
      formData.append('file', avatarFile.value);
      formData.append('name', 'avatar_' + Date.now()); // 给头像一个唯一的名称

      // 上传头像到服务器
      const uploadResponse = await uploadImage(formData, {
        onUploadProgress: (progressEvent) => {
          // 计算上传进度百分比
          let percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);

          // 上传结束前，最高显示到98%，表示还有服务器处理时间
          if (percent >= 98) {
            percent = 98;
          }

          uploadProgress.value = percent;
        }
      });

      // 上传结束
      uploadProgress.value = 100;

      if (uploadResponse.code === 200) {
        // 获取头像URL
        avatarUrl = uploadResponse.data.url;
      } else {
        throw new Error(uploadResponse.message || '头像上传失败');
      }

      // 结束上传状态
      setTimeout(() => {
        isUploading.value = false;
      }, 300); // 短暂延迟，让用户看到100%
    } 
    // 如果选择了相册的图片作为头像
    else if (selectedGalleryImageUrl.value) {
      avatarUrl = selectedGalleryImageUrl.value;
    }

    // 调用更新用户信息API
    const response = await updateUserInfo({
      nickname: editNickname.value,
      avatar: avatarUrl
    });

    if (response.code === 200) {
      // 清除临时预览和选择
      avatarPreview.value = '';
      avatarFile.value = null;
      selectedGalleryImageUrl.value = '';

      // 尝试从服务器获取最新用户信息
      await authStore.fetchUserInfo();

      // 为了确保头像立即更新，手动更新本地用户信息
      // 这样即使服务器缓存问题导致fetchUserInfo未返回最新头像，UI依然会更新
      authStore.updateUser({
        ...user.value,
        nickname: editNickname.value,
        avatar: avatarUrl + '?t=' + new Date().getTime() // 添加时间戳避免浏览器缓存
      });

      toastStore.success('个人信息更新成功');
      isEditing.value = false;
    } else {
      throw new Error(response.message || '更新用户信息失败');
    }

  } catch (error) {
    console.error('更新用户信息失败:', error);
    toastStore.error('更新用户信息失败: ' + error.message);
    isUploading.value = false;
  } finally {
    isSubmitting.value = false;
  }
};

// 取消编辑时重置所有状态
const cancelEditing = () => {
  isEditing.value = false;
  avatarPreview.value = '';
  avatarFile.value = null;
  selectedGalleryImageUrl.value = '';
};

// 处理头像上传
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 验证文件类型
  if (!file.type.match('image.*')) {
    toastStore.error('请上传图片文件');
    return;
  }

  // 验证文件大小（限制为5MB）
  if (file.size > 5 * 1024 * 1024) {
    toastStore.error('图片大小不能超过5MB');
    return;
  }

  avatarFile.value = file;

  // 创建预览
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 格式化存储空间大小
const formatStorage = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// 关闭对话框
const cancel = () => {
  emit('update:modelValue', false);
};

// 退出登录
const logout = async () => {
  // 关闭个人信息对话框，以便确认弹窗可见
  emit('update:modelValue', false);

  // 显示确认弹窗
  setTimeout(() => {
    toastStore.confirm('确定要退出登录吗？', {
      title: '退出确认'
    }).then(confirmed => {
      if (confirmed) {
        authStore.logout();
        toastStore.success('已成功退出登录');
      }
    });
  }, 100); // 短暂延迟，确保个人信息对话框已完全关闭
};

// 初始化统计数据
initStats();
</script>

<style scoped>
.draggable-handle {
  cursor: grab;
  user-select: none;
}

.draggable-handle.dragging {
  cursor: grabbing;
}
</style> 