<template>
  <div class="flex h-screen w-full bg-background">
    <!-- 左侧随机大图  -->
    <div class="hidden md:block md:w-1/2 lg:w-2/3 relative overflow-hidden">
      <img :src="`https://img.loliapi.cn/i/pc/img${randomImageId}.webp`" class="h-full w-full object-cover" />
      <div class="absolute inset-0 bg-black/15 flex items-start justify-start">
        <div class="text-white p-2 mt-2">
          <h5 class="font-bold mb-2 drop-shadow-md text-2xl">KiriImage</h5>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center bg-background md:bg-background relative">
      <!-- 移动端背景图 -->
      <div class="absolute inset-0 w-full h-full overflow-hidden md:hidden">
        <img :src="`https://img.loliapi.cn/i/pe/img${randomImageId2}.webp`" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-black/40"></div>
      </div>

      <div class="w-full max-w-md space-y-8 p-8 md:p-10 relative z-10">

        <!-- 移动端上的品牌Logo和标题 -->
        <div class="text-center md:hidden">
          <h1 class="text-3xl font-bold tracking-tight text-white">
            KiriImage
          </h1>
          <p class="mt-3 text-sm text-white/80">
            请登录您的账号以访问在线相册
          </p>
        </div>

        <!-- 桌面端的登录标题 -->
        <div class="hidden md:block">
          <h2 class="text-2xl font-bold tracking-tight text-foreground">
            欢迎回来
          </h2>
          <p class="mt-2 text-sm text-muted-foreground">
            请登录您的账号继续使用
          </p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="space-y-6 relative z-10">
          <div class="space-y-4">
            <!-- 用户名输入 -->
            <div class="relative">
              <label for="username" class="absolute left-3 text-sm font-medium transition-all" :class="[
                  username || isFocusedUsername
                    ? 'top-2 text-xs text-primary'
                    : 'top-1/2 -translate-y-1/2 text-muted-foreground md:text-muted-foreground text-white/80',
                ]">
                输入用户名
              </label>
              <input id="username" v-model="username" type="text" class="w-full rounded-md border px-3 pt-6 pb-2 transition-all focus:outline-none" :class="[
                  isFocusedUsername
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-input bg-background/95 md:bg-background',
                ]" @focus="isFocusedUsername = true" @blur="isFocusedUsername = false" :disabled="authStore.loading" />
            </div>

            <!-- 密码输入 -->
            <div class="relative">
              <label for="password" class="absolute left-3 text-sm font-medium transition-all" :class="[
                  password || isFocusedPassword
                    ? 'top-2 text-xs text-primary'
                    : 'top-1/2 -translate-y-1/2 text-muted-foreground md:text-muted-foreground text-white/80',
                ]">
                输入密码
              </label>
              <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" class="w-full rounded-md border px-3 pt-6 pb-2 pr-10 transition-all focus:outline-none" :class="[
                  isFocusedPassword
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-input bg-background/95 md:bg-background',
                ]" @focus="isFocusedPassword = true" @blur="isFocusedPassword = false" :disabled="authStore.loading" />
              <!-- 显示/隐藏密码按钮 -->
              <button type="button" @click="togglePassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" :disabled="authStore.loading">
                <EyeIcon v-if="showPassword" class="h-4 w-4" />
                <EyeSlashIcon v-else class="h-4 w-4" />
              </button>
            </div>

            <!-- 验证码输入 -->
            <div class="relative">
              <label for="verificationCode" class="absolute left-3 text-sm font-medium transition-all" :class="[
                  verificationCode || isFocusedVerificationCode
                    ? 'top-2 text-xs text-primary'
                    : 'top-1/2 -translate-y-1/2 text-muted-foreground md:text-muted-foreground text-white/80',
                ]">
                输入验证码
              </label>
              <input id="verificationCode" v-model="verificationCode" type="text" class="w-full rounded-md border px-3 pt-6 pb-2 pr-32 transition-all focus:outline-none" :class="[
                  isFocusedVerificationCode
                    ? 'border-primary ring-1 ring-primary'
                    : 'border-input bg-background/95 md:bg-background',
                ]" @focus="isFocusedVerificationCode = true" @blur="isFocusedVerificationCode = false" :disabled="authStore.loading" />
              <!-- 发送验证码按钮 -->
              <button type="button" @click="sendVerificationCode" class="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 text-xs rounded-md transition-colors" :class="[
                  countdown > 0
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                ]" :disabled="countdown > 0 || authStore.loading">
                {{ countdown > 0 ? `${countdown}s` : '验证' }}
              </button>
            </div>
          </div>

          <!-- 错误消息显示 -->
          <div v-if="authStore.error" class="rounded-md bg-destructive/10 p-4">
            <p class="text-sm font-medium text-destructive">
              {{ authStore.error }}
            </p>
          </div>

          <!-- 登录按钮 -->
          <div>
            <button type="submit" class="w-full rounded-md bg-primary px-4 py-3 text-base font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" :disabled="authStore.loading">
              <span v-if="authStore.loading" class="flex items-center justify-center">
                <span class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                登录中...
              </span>
              <span v-else>登录</span>
            </button>
          </div>
        </form>

        <!-- 版权信息 -->
        <div class="mt-8 text-center text-xs md:text-muted-foreground text-white/70 relative z-10">
          &copy; {{ new Date().getFullYear() }} KiriImage By Kiri · 保留所有权利
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { EyeIcon, EyeSlashIcon } from "@heroicons/vue/24/outline";
import { sendVerificationCode as sendVerificationCodeApi } from "../api/user"; // 导入API函数
import { useToastStore } from "../stores/toastStore"; // 导入toastStore

const authStore = useAuthStore();
const username = ref("");
const password = ref("");
const verificationCode = ref("");
const randomImageId = ref(Math.floor(Math.random() * 696 + 1)); // 生成1-697的随机数
const randomImageId2 = ref(Math.floor(Math.random() * 3068 + 1)); // 生成1-3069的随机数

// 添加输入框焦点状态
const isFocusedUsername = ref(false);
const isFocusedPassword = ref(false);
const isFocusedVerificationCode = ref(false);

// 添加密码显示/隐藏状态
const showPassword = ref(false);

// 添加验证码相关状态
const countdown = ref(0);
let countdownTimer = null;

// 初始化倒计时状态
const initCountdown = () => {
  const savedEndTime = localStorage.getItem('verificationCodeEndTime');
  if (savedEndTime) {
    const endTime = parseInt(savedEndTime);
    const now = Date.now();
    const remainingTime = Math.ceil((endTime - now) / 1000);

    if (remainingTime > 0) {
      countdown.value = remainingTime;
      startCountdown();
    } else {
      // 倒计时已结束，清除存储
      localStorage.removeItem('verificationCodeEndTime');
    }
  }
};

// 开始倒计时
const startCountdown = () => {
  countdownTimer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(countdownTimer);
      countdownTimer = null;
      localStorage.removeItem('verificationCodeEndTime');
    }
  }, 1000);
};

const handleLogin = async () => {
  if (!username.value) {
    useToastStore().alert('请输入用户名！');
    return;
  }
  if (!password.value) {
    useToastStore().alert('请输入密码！');
    return;
  }
  if (!verificationCode.value) {
    useToastStore().alert('请输入验证码！');
    return;
  }

  await authStore.login(username.value, password.value, verificationCode.value);
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// 发送验证码
const sendVerificationCode = async () => {
  if (countdown.value > 0) return;

  if (!username.value) {
    useToastStore().alert('请输入用户名！'); // 使用toastStore.alert()替换alert()
    return;
  }

  try {
    // 调用发送验证码的API
    const response = await sendVerificationCodeApi(username.value);

    if (response.code === 200) {
      // 开始倒计时并保存结束时间到localStorage
      countdown.value = 60;
      const endTime = Date.now() + 60000; // 60秒后
      localStorage.setItem('verificationCodeEndTime', endTime.toString());
      startCountdown();

      // 成功提示
      useToastStore().success(response.message || '验证码已发送，请检查您的邮箱。');
    } else {
      // 失败提示
      useToastStore().error(response.message || '发送验证码失败，请稍后再试。');
    }

  } catch (error) {
    console.error('发送验证码失败:', error);
    useToastStore().error(error.message || '发送验证码失败，请稍后再试。');
  }
};

// 组件挂载时初始化倒计时
onMounted(() => {
  initCountdown();
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
/* 添加平滑过渡效果 */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>
