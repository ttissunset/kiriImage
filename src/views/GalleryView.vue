<template>
  <div class="p-4 md:p-6 lg:p-8">
    <!-- 页面标题和工具栏 -->
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-xl font-semibold text-card-foreground sm:text-2xl">所有照片</h1>

      <div class="flex flex-wrap items-center gap-2">
        <!-- 选择计数和操作按钮 -->
        <div v-if="galleryStore.hasSelected" class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">已选择 {{ galleryStore.selectedCount }} 项</span>
          <Button variant="outline" size="sm" @click="galleryStore.clearSelection">
            取消选择
          </Button>
          <Button variant="destructive" size="sm" @click="openDeleteMultipleDialog">
            删除所选
          </Button>
        </div>

        <!-- 全选按钮 -->
        <Button v-if="!galleryStore.hasSelected && galleryStore.images.length > 0" variant="outline" size="sm" @click="galleryStore.selectAll">
          全选
        </Button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="galleryStore.isLoading" class="flex justify-center py-12">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="galleryStore.error" class="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
      {{ galleryStore.error }}
      <Button variant="outline" class="mt-2" @click="galleryStore.fetchImages">重试</Button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="galleryStore.images.length === 0" class="py-12 text-center">
      <p class="text-lg text-muted-foreground">暂无图片</p>
    </div>

    <!-- 图片网格 - 修改为完全模仿截图中的布局 -->
    <div v-else>
      <!-- 日期分组标题 -->
      <div class="mb-2 mt-6 flex items-center">
        <h2 class="text-lg font-medium">最近添加</h2>
      </div>

      <!-- 照片网格 - 统一大小的网格 -->
      <div class="grid-gallery">
        <div v-for="image in galleryStore.images" :key="image.id" class="grid-item">
          <ImageCard :image="image" @rename="openRenameDialog" @delete="openDeleteDialog" />
        </div>
      </div>

      <!-- 底部信息栏 - iCloud风格 -->
      <div class="mt-10 border-t pt-4 text-center text-sm text-muted-foreground">
        <p>{{ galleryStore.images.length }} 张照片</p>
        <p>最后更新于 {{ formatUpdateTime(new Date()) }}</p>
      </div>
    </div>
  </div>

  <!-- 重命名对话框 -->
  <RenameDialog v-model="showRenameDialog" :image="selectedImage" @rename="handleRename" />

  <!-- 删除对话框 -->
  <DeleteConfirmDialog v-model="showDeleteDialog" :image="selectedImage" @confirm="handleDelete" />

  <!-- 批量删除对话框 -->
  <DeleteConfirmDialog v-model="showDeleteMultipleDialog" :multiple="true" :count="galleryStore.selectedCount" @confirm="handleDeleteMultiple" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGalleryStore } from '../stores/galleryStore'
import Button from '../components/ui/Button.vue'
import ImageCard from '../components/ImageCard.vue'
import RenameDialog from '../components/RenameDialog.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'

const galleryStore = useGalleryStore()

const showRenameDialog = ref(false)
const showDeleteDialog = ref(false)
const showDeleteMultipleDialog = ref(false)
const selectedImage = ref(null)

// 加载图片
onMounted(() => {
  galleryStore.fetchImages()
})

// 打开重命名对话框
const openRenameDialog = (image) => {
  selectedImage.value = image
  showRenameDialog.value = true
}

// 打开删除对话框
const openDeleteDialog = (image) => {
  selectedImage.value = image
  showDeleteDialog.value = true
}

// 打开批量删除对话框
const openDeleteMultipleDialog = () => {
  showDeleteMultipleDialog.value = true
}

// 处理重命名
const handleRename = ({ id, name }) => {
  galleryStore.updateImageName(id, name)
}

// 处理删除
const handleDelete = () => {
  if (selectedImage.value) {
    galleryStore.deleteImage(selectedImage.value.id)
  }
}

// 处理批量删除
const handleDeleteMultiple = () => {
  galleryStore.deleteSelectedImages()
}

// 格式化更新时间
const formatUpdateTime = (date) => {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.grid-gallery {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  margin: 0 auto;
  width: 100%;
}

.grid-item {
  aspect-ratio: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .grid-gallery {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 768px) {
  .grid-gallery {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .grid-gallery {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 