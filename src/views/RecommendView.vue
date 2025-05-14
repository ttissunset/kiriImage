<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- 页面标题和工具栏 -->
    <div class="flex-none z-10 bg-background px-4 py-2 md:px-6 lg:px-8 border-b shadow-sm">
      <div class="flex items-center justify-between">
        <h5 class="text-lg font-semibold text-card-foreground sm:text-xl">
          每日推荐
        </h5>

        <!-- 刷新按钮 -->
        <Button variant="outline" size="sm" @click="refreshPage" class="flex items-center gap-1">
          <ArrowPathIcon class="h-4 w-4" />
        </Button>
      </div>
    </div>

    <!-- 图片展示区域 - 占据除头部外的所有空间 -->
    <div class="flex-1 w-full overflow-hidden">
      <img src="https://www.loliapi.com/acg/" class="w-full h-full object-cover" />
    </div>
  </div>
</template>

<script setup>
import Button from "../components/ui/Button.vue";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";

// 刷新页面函数
const refreshPage = () => {
  window.location.reload();
};
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