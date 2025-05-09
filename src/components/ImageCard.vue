<template>
  <div class="w-full h-full overflow-hidden rounded-lg text-card-foreground transition-all" @click="toggleSelect">
    <!-- 图片区域 - iCloud风格居中显示 -->
    <div class="flex h-full w-full items-center justify-center p-4 relative group">
      <img :src="image.thumbnailUrl" :alt="image.name" class="max-h-full max-w-full object-contain transition-all relative" :class="{ 'ring-2 ring-primary ring-offset-2 ': selected }" :style="{
          maxWidth: '100%',
          maxHeight: '100%',
        }" @dblclick.stop="openPreview" />
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useGalleryStore } from "../stores/galleryStore";
import { useToastStore } from "../stores/toastStore";
import { LinkIcon, PencilIcon, TrashIcon, HeartIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  image: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["rename", "delete"]);
const router = useRouter();
const galleryStore = useGalleryStore();
const toastStore = useToastStore();

const selected = computed(() => {
  return galleryStore.isSelected(props.image.id);
});

const isFavorite = computed(() => {
  return galleryStore.isFavorite(props.image.id);
});

const toggleSelect = () => {
  galleryStore.toggleSelect(props.image.id);
};

const toggleFavorite = () => {
  const wasAlreadyFavorite = galleryStore.isFavorite(props.image.id);
  galleryStore.toggleFavorite(props.image.id);

  // 添加提示消息
  if (wasAlreadyFavorite) {
    toastStore.info(`已取消收藏 "${props.image.name}"`);
  } else {
    toastStore.success(`已收藏 "${props.image.name}"`);
  }
};

const openPreview = () => {
  // 查找当前图片在数组中的索引
  const imageIndex = galleryStore.images.findIndex(img => img.id === props.image.id);
  if (imageIndex !== -1) {
    router.push({ name: 'preview', params: { id: imageIndex } });
  }
};

const copyUrl = () => {
  navigator.clipboard
    .writeText(props.image.url)
    .then(() => {
      toastStore.success("图片链接已复制到剪贴板");
    })
    .catch((err) => {
      console.error("复制失败:", err);
      toastStore.error("复制失败: " + err.message);
    });
};

const onRename = () => {
  emit("rename", props.image);
};

const onDelete = () => {
  emit("delete", props.image);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};
</script>
