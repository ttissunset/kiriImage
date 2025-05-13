<template>
  <div class="relative h-full">
    <!-- 页面标题和工具栏 -->
    <div
      class="sticky top-0 z-10 bg-background px-3 py-2 md:px-4 lg:px-6 border-b shadow-sm"
    >
      <div class="flex items-center justify-between">
        <h5 class="text-base font-semibold text-card-foreground sm:text-lg">
          数据统计中心
        </h5>

        <!-- 刷新按钮 -->
        <Button
          variant="outline"
          size="icon"
          @click="refreshData"
          title="刷新数据"
          class="h-7 w-7"
          :disabled="loading"
        >
          <ArrowPathIcon
            class="h-3.5 w-3.5"
            :class="{ 'animate-spin': loading }"
          />
          <span v-if="partialLoading" class="sr-only">更新中...</span>
        </Button>
      </div>
    </div>

    <div class="p-3 md:p-4 lg:p-5">
      <!-- 加载状态 -->
      <div v-if="loading && !partialLoading" class="flex justify-center py-8">
        <div
          class="h-10 w-10 animate-spin rounded-full border-3 border-muted border-t-primary"
        ></div>
      </div>

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <!-- 系统信息卡片 -->
          <div class="bg-card rounded-lg shadow-sm p-3 border border-border/60">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-muted-foreground">
                系统信息
              </h3>
              <span
                v-if="partialLoading"
                class="text-xs text-muted-foreground flex items-center"
              >
                <ArrowPathIcon class="h-3 w-3 mr-1 animate-spin" />
              </span>
            </div>
            <div class="space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">CPU</span>
                <span class="text-xs font-medium">{{ systemInfo.cpu }}</span>
              </div>

              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">内存</span>
                  <span class="text-xs font-medium"
                    >{{ systemInfo.memory.total }} (已用:
                    {{ systemInfo.memory.used }})</span
                  >
                </div>
                <div class="flex items-center mt-1">
                  <div class="w-full bg-muted/60 rounded-full h-1.5 mr-2">
                    <div
                      class="bg-emerald-500 h-1.5 rounded-full"
                      :style="`width: ${systemInfo.memory.usage || '0%'}`"
                    ></div>
                  </div>
                  <span class="text-xs font-medium text-emerald-500">{{
                    systemInfo.memory.usage || "0%"
                  }}</span>
                </div>
              </div>

              <div
                v-if="systemInfo.gpu"
                class="flex items-center justify-between"
              >
                <span class="text-xs text-muted-foreground">GPU</span>
                <span class="text-xs font-medium">{{ systemInfo.gpu }}</span>
              </div>

              <div class="pt-1.5 border-t mt-1.5">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-muted-foreground">操作系统</span>
                  <span class="text-xs font-medium">{{ systemInfo.os }}</span>
                </div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-muted-foreground">IP地址</span>
                  <span class="text-xs font-medium">{{ systemInfo.ip }}</span>
                </div>
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-muted-foreground">ISP提供商</span>
                  <span class="text-xs font-medium">{{ systemInfo.isp }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-xs text-muted-foreground">地理位置</span>
                  <span class="text-xs font-medium">{{
                    systemInfo.region
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- R2存储使用统计卡片 -->
          <div
            class="bg-card rounded-lg shadow-sm p-3 border border-border/60 md:col-span-2"
          >
            <h2 class="text-sm font-medium text-muted-foreground mb-2">
              R2存储使用情况
            </h2>
            <div class="grid grid-cols-3 gap-3">
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">已用存储</h3>
                <p class="text-lg font-bold">
                  {{ formatStorage(stats.r2UsedStorage) }}
                </p>
              </div>
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">请求次数</h3>
                <p class="text-lg font-bold">
                  {{ stats.r2Requests.toLocaleString() }}
                </p>
              </div>
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">带宽使用</h3>
                <p class="text-lg font-bold">
                  {{ formatStorage(stats.r2Bandwidth) }}
                </p>
              </div>
            </div>

            <!-- 存储用量趋势图 -->
            <div class="h-48 mt-3">
              <div
                v-if="loading"
                class="h-full flex items-center justify-center text-muted-foreground"
              >
                加载中...
              </div>
              <div v-else class="w-full h-full">
                <apexchart
                  type="line"
                  height="100%"
                  :options="storageChartOptions"
                  :series="storageChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          <!-- 访客IP列表 -->
          <div
            class="bg-card rounded-lg shadow-sm p-3 border border-border/60 lg:col-span-2"
          >
            <h2 class="text-sm font-medium text-muted-foreground mb-2">
              最近登录记录
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border/60">
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      用户名
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      IP地址
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      位置
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      设备
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      访问时间
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(ip, index) in recentIPs"
                    :key="index"
                    class="border-b border-border/60 hover:bg-muted/40"
                  >
                    <td class="py-1.5 px-2 font-medium">{{ ip.username }}</td>
                    <td class="py-1.5 px-2">{{ ip.address }}</td>
                    <td class="py-1.5 px-2">{{ ip.location }}</td>
                    <td class="py-1.5 px-2">{{ ip.browser }} / {{ ip.os }}</td>
                    <td class="py-1.5 px-2">{{ ip.time }}</td>
                    <td class="py-1.5 px-2">
                      <span
                        :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium`"
                      >
                        {{ ip.status === "success" ? "成功" : "失败" }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 用户统计 -->
          <div class="bg-card rounded-lg shadow-sm p-3 border border-border/60">
            <h2 class="text-sm font-medium text-muted-foreground mb-2">
              用户统计
            </h2>
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div
                class="bg-background p-2 rounded-md border border-border/60 flex justify-between items-center"
              >
                <h3 class="text-xs text-muted-foreground">注册用户</h3>
                <p class="text-lg font-bold">{{ userStats.totalUsers }}</p>
              </div>
              <div
                class="bg-background p-2 rounded-md border border-border/60 flex justify-between items-center"
              >
                <h3 class="text-xs text-muted-foreground">活跃用户</h3>
                <p class="text-lg font-bold">{{ userStats.activeUsers }}</p>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border/60">
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      用户
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      昵称
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      角色
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      创建时间
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      最后活动
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(user, index) in topUsers"
                    :key="index"
                    class="border-b border-border/60 hover:bg-muted/40"
                  >
                    <td class="py-1.5 px-2">
                      <div class="flex items-center">
                        <img
                          :src="user.avatar"
                          alt="avatar"
                          class="w-6 h-6 rounded-full mr-2"
                        />
                      </div>
                    </td>
                    <td class="py-1.5 px-2">{{ user.username }}</td>
                    <td class="py-1.5 px-2">
                      {{ user.role === 1 ? "管理员" : "普通用户" }}
                    </td>
                    <td class="py-1.5 px-2">{{ user.createdAt }}</td>
                    <td class="py-1.5 px-2">{{ user.lastActive }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 上传记录数据统计 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <!-- 上传趋势图表 -->
          <div class="bg-card rounded-lg shadow-sm p-3 border border-border/60">
            <h2 class="text-sm font-medium text-muted-foreground mb-2">
              上传趋势
            </h2>
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">今日上传</h3>
                <p class="text-lg font-bold">{{ uploadStats.todayUploads }}</p>
              </div>
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">总上传数</h3>
                <p class="text-lg font-bold">{{ uploadStats.totalUploads }}</p>
              </div>
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">平均大小</h3>
                <p class="text-lg font-bold">
                  {{ formatStorage(uploadStats.averageSize) }}
                </p>
              </div>
            </div>
            <div class="h-48">
              <div
                v-if="loading"
                class="h-full flex items-center justify-center text-muted-foreground"
              >
                加载中...
              </div>
              <div v-else class="w-full h-full">
                <apexchart
                  type="bar"
                  height="100%"
                  :options="uploadTrendChartOptions"
                  :series="uploadTrendChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>

          <!-- 上传类型分布 -->
          <div class="bg-card rounded-lg shadow-sm p-3 border border-border/60">
            <h2 class="text-sm font-medium text-muted-foreground mb-2">
              上传类型分布
            </h2>
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">图片</h3>
                <p class="text-lg font-bold">{{ uploadStats.imageCount }}</p>
              </div>
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">视频</h3>
                <p class="text-lg font-bold">{{ uploadStats.videoCount }}</p>
              </div>
              <div class="bg-background p-2 rounded-md border border-border/60">
                <h3 class="text-xs text-muted-foreground mb-1">其他文件</h3>
                <p class="text-lg font-bold">{{ uploadStats.otherCount }}</p>
              </div>
            </div>
            <div class="h-48">
              <div
                v-if="loading"
                class="h-full flex items-center justify-center text-muted-foreground"
              >
                加载中...
              </div>
              <div v-else class="w-full h-full">
                <apexchart
                  type="donut"
                  height="100%"
                  :options="uploadTypeChartOptions"
                  :series="uploadTypeChartSeries"
                ></apexchart>
              </div>
            </div>
          </div>

          <!-- 最近上传记录 -->
          <div
            class="bg-card rounded-lg shadow-sm p-3 border border-border/60 lg:col-span-2 mt-3"
          >
            <h2 class="text-sm font-medium text-muted-foreground mb-2">
              最近上传记录
            </h2>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-border/60">
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      文件名
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      类型
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      大小
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      上传时间
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      上传用户
                    </th>
                    <th
                      class="text-left py-1.5 px-2 text-xs font-medium text-muted-foreground"
                    >
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(upload, index) in recentUploads"
                    :key="index"
                    class="border-b border-border/60 hover:bg-muted/40"
                  >
                    <td class="py-1.5 px-2 font-medium max-w-[180px] truncate">
                      {{ upload.fileName }}
                    </td>
                    <td class="py-1.5 px-2">{{ upload.fileType }}</td>
                    <td class="py-1.5 px-2">
                      {{ formatStorage(upload.fileSize) }}
                    </td>
                    <td class="py-1.5 px-2">{{ upload.uploadTime }}</td>
                    <td class="py-1.5 px-2">{{ upload.username }}</td>
                    <td class="py-1.5 px-2">
                      <span
                        :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${upload.status === '成功' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`"
                      >
                        {{ upload.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import VueApexCharts from "vue3-apexcharts";
import { ArrowPathIcon } from "@heroicons/vue/24/outline";
import Button from "../components/ui/Button.vue";
import { throttle } from "../utils/performance";
import { getSystemInfo, getLoginRecords, getAllUsers } from "../api/stats";

const authStore = useAuthStore();
const router = useRouter();
const loading = ref(true);
const partialLoading = ref(false); // 局部加载状态

// ================ 模拟数据 ================
const stats = ref({
  r2UsedStorage: 15.6 * 1024 * 1024 * 1024,
  r2Requests: 158642,
  r2Bandwidth: 156.8 * 1024 * 1024 * 1024,
});

// 上传统计数据
const uploadStats = ref({
  todayUploads: 48,
  totalUploads: 3842,
  averageSize: 4.2 * 1024 * 1024, // 4.2MB
  imageCount: 2856,
  videoCount: 687,
  otherCount: 299,
});

// 最近访问IP数据
const recentIPs = ref([]);

// 加载登录记录
const fetchLoginRecords = async () => {
  try {
    const response = await getLoginRecords({ limit: 5 }); // 只获取最近5条记录
    if (response.code === 200) {
      // 将API返回的数据转换为组件中使用的格式
      recentIPs.value = response.data.items.map((record) => ({
        address: record.ip,
        location: record.region,
        time: formatDate(record.createdAt),
        count: 1, // API中没有计数，默认为1
        username: record.username,
        status: record.status,
        browser: record.browser,
        os: record.os,
      }));
    } else {
      console.error("获取登录记录失败:", response.message);
    }
  } catch (error) {
    console.error("获取登录记录出错:", error);
  }
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// 模拟最近上传记录
const recentUploads = ref([
  {
    fileName: "sunset_vacation_2023.jpg",
    fileType: "图片",
    fileSize: 5.2 * 1024 * 1024,
    uploadTime: "2023-08-10 15:45:22",
    username: "kiri",
    status: "成功",
  },
  {
    fileName: "company_presentation.mp4",
    fileType: "视频",
    fileSize: 75 * 1024 * 1024,
    uploadTime: "2023-08-10 15:30:15",
    username: "image_master",
    status: "成功",
  },
  {
    fileName: "family_trip.jpg",
    fileType: "图片",
    fileSize: 3.8 * 1024 * 1024,
    uploadTime: "2023-08-10 14:22:08",
    username: "user123",
    status: "成功",
  },
  {
    fileName: "project_documentation.pdf",
    fileType: "文档",
    fileSize: 2.5 * 1024 * 1024,
    uploadTime: "2023-08-10 14:15:30",
    username: "collector",
    status: "成功",
  },
  {
    fileName: "business_proposal.pptx",
    fileType: "文档",
    fileSize: 8.7 * 1024 * 1024,
    uploadTime: "2023-08-10 14:05:18",
    username: "user123",
    status: "失败",
  },
  {
    fileName: "birthday_party.mp4",
    fileType: "视频",
    fileSize: 120 * 1024 * 1024,
    uploadTime: "2023-08-10 12:45:30",
    username: "kiri",
    status: "成功",
  },
]);

// 系统硬件信息数据
const systemInfo = ref({
  cpu: "",
  memory: {
    total: "",
    used: "",
    usage: "",
  },
  gpu: "",
  os: "",
  ip: "",
  isp: "",
  region: "",
});

// 加载系统信息
const fetchSystemInfo = async () => {
  try {
    const response = await getSystemInfo();
    if (response.code === 200) {
      systemInfo.value = response.data;
    } else {
      console.error("获取系统信息失败:", response.message);
    }
  } catch (error) {
    console.error("获取系统信息出错:", error);
  }
};

// 用户统计数据
const topUsers = ref([]);
const userStats = ref({
  totalUsers: 0,
  activeUsers: 0,
});

// 加载用户数据
const fetchUsers = async () => {
  try {
    const response = await getAllUsers({ limit: 5 }); // 获取5个用户
    if (response.code === 200) {
      // 更新用户总数
      userStats.value.totalUsers = response.data.total;

      // 获取登录记录数据用于确定最后活动时间
      const loginRecordsResponse = await getLoginRecords({ limit: 50 });
      let userLastLogin = {};

      // 整理用户登录记录，找出每个用户最近的登录时间
      if (loginRecordsResponse.code === 200) {
        loginRecordsResponse.data.items.forEach((record) => {
          if (
            !userLastLogin[record.username] ||
            new Date(record.createdAt) >
              new Date(userLastLogin[record.username])
          ) {
            userLastLogin[record.username] = record.createdAt;
          }
        });
      }

      // 将API返回的数据转换为组件中使用的格式
      topUsers.value = response.data.items.map((user) => ({
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        createdAt: formatDate(user.createdAt),
        // 使用最后登录时间作为最后活动时间，如果没有登录记录则显示--
        lastActive: userLastLogin[user.username]
          ? formatDate(userLastLogin[user.username])
          : "--",
      }));

      // 随机设置活跃用户数量(真实情况应从API获取)
      userStats.value.activeUsers = Math.floor(response.data.total * 0.35);
    } else {
      console.error("获取用户信息失败:", response.message);
    }
  } catch (error) {
    console.error("获取用户信息出错:", error);
  }
};

// 存储用量趋势图
const storageChartSeries = ref([
  {
    name: "R2存储用量(GB)",
    data: [7.8, 8.5, 9.1, 10.2, 11.5, 12.3, 13.1, 13.8, 14.2, 14.9, 15.3, 15.6],
  },
]);

const storageChartOptions = ref({
  chart: {
    type: "line",
    toolbar: {
      show: false,
    },
    fontFamily: "inherit",
    sparkline: {
      enabled: false,
    },
    zoom: {
      enabled: false,
    },
  },
  stroke: {
    curve: "smooth",
    width: 2.5,
  },
  colors: ["#10b981"],
  markers: {
    size: 3,
  },
  grid: {
    padding: {
      left: 5,
      right: 5,
    },
  },
  xaxis: {
    categories: [...Array(12).keys()].map((i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - 11 + i);
      return `${d.getFullYear()}/${d.getMonth() + 1}`;
    }),
    labels: {
      style: {
        fontFamily: "inherit",
        fontSize: "10px",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      style: {
        fontFamily: "inherit",
        fontSize: "10px",
      },
      formatter: function (value) {
        return value.toFixed(1);
      },
    },
  },
  tooltip: {
    theme: "light",
    x: {
      show: false,
    },
  },
  theme: {
    mode: "light",
  },
});

// 上传趋势图表
const uploadTrendChartSeries = ref([
  {
    name: "上传数量",
    data: [42, 53, 57, 68, 72, 89, 92, 85, 76, 65, 58, 48],
  },
]);

const uploadTrendChartOptions = ref({
  chart: {
    type: "bar",
    toolbar: {
      show: false,
    },
    fontFamily: "inherit",
    sparkline: {
      enabled: false,
    },
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: "70%",
    },
  },
  dataLabels: {
    enabled: false,
  },
  colors: ["#3b82f6"],
  grid: {
    padding: {
      left: 5,
      right: 5,
      bottom: 0,
    },
  },
  xaxis: {
    categories: [...Array(12).keys()].map((i) => {
      const d = new Date();
      d.setDate(d.getDate() - 11 + i);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }),
    labels: {
      style: {
        fontFamily: "inherit",
        fontSize: "10px",
      },
    },
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    labels: {
      style: {
        fontFamily: "inherit",
        fontSize: "10px",
      },
    },
  },
  tooltip: {
    y: {
      formatter: function (value) {
        return value + " 个文件";
      },
    },
  },
  theme: {
    mode: "light",
  },
});

// 上传类型分布图表
const uploadTypeChartSeries = ref([
  uploadStats.value.imageCount,
  uploadStats.value.videoCount,
  uploadStats.value.otherCount,
]);

const uploadTypeChartOptions = ref({
  chart: {
    type: "donut",
    fontFamily: "inherit",
  },
  labels: ["图片", "视频", "其他"],
  colors: ["#3b82f6", "#f59e0b", "#6366f1"],
  legend: {
    position: "bottom",
    fontFamily: "inherit",
    fontSize: "12px",
    offsetY: 0,
    itemMargin: {
      horizontal: 8,
      vertical: 0,
    },
  },
  plotOptions: {
    pie: {
      donut: {
        size: "60%",
      },
    },
  },
  dataLabels: {
    enabled: true,
    style: {
      fontFamily: "inherit",
      fontSize: "10px",
    },
    formatter: function (val, opt) {
      return Math.round(val) + "%";
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        legend: {
          position: "bottom",
        },
      },
    },
  ],
  tooltip: {
    y: {
      formatter: function (value) {
        return value + " 个文件";
      },
    },
  },
  theme: {
    mode: "light",
  },
});

// 格式化存储大小
const formatStorage = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
  else if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

// 刷新数据 - 使用节流避免频繁刷新
const refreshData = throttle(() => {
  partialLoading.value = true;

  // 模拟API请求延迟
  setTimeout(() => {
    // 更新系统信息
    fetchSystemInfo();
    // 更新登录记录
    fetchLoginRecords();
    // 更新用户数据
    fetchUsers();

    partialLoading.value = false;
  }, 800);
}, 1000);

// 组件挂载时执行
onMounted(() => {
  // 模拟加载数据
  setTimeout(() => {
    loading.value = false;
  }, 800);

  // 加载系统信息
  fetchSystemInfo();

  // 加载登录记录
  fetchLoginRecords();

  // 加载用户数据
  fetchUsers();

  // 每分钟自动刷新一次数据
  const autoRefreshInterval = setInterval(() => {
    if (document.visibilityState === "visible") {
      refreshData();
    }
  }, 60000);

  // 添加窗口可见性变化监听，优化性能
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshData();
    }
  });

  // 组件卸载时清除定时器
  onUnmounted(() => {
    clearInterval(autoRefreshInterval);
  });
});
</script>

<style scoped>
/* 安全区适配 */
@supports (padding: max(0px)) {
  .p-3 {
    padding-left: max(0.75rem, env(safe-area-inset-left));
    padding-right: max(0.75rem, env(safe-area-inset-right));
  }
}

/* 美化表格样式 */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* 为表格添加圆角 */
table {
  border-radius: 0.375rem;
  overflow: hidden;
}

/* 表格悬停效果 */
tbody tr:hover {
  transition: all 0.2s ease;
}
</style>
