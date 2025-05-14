import { createRouter, createWebHistory } from "vue-router";
import GalleryView from "../views/GalleryView.vue";
import FavoriteView from "../views/FavoriteView.vue";
import ImagePreview from "../components/ImagePreview.vue";
import UploadView from "../views/UploadView.vue";
import LoginView from "../views/LoginView.vue";
import DataDashboardView from "../views/DataDashboardView.vue";
import RecommendView from "../views/RecommendView.vue";
import { useAuthStore } from "../stores/authStore";

const routes = [
  {
    path: "/",
    name: "gallery",
    component: GalleryView,
    meta: { requiresAuth: true },
  },
  {
    path: "/favorites",
    name: "favorites",
    component: FavoriteView,
    meta: { requiresAuth: true },
  },
  {
    path: "/preview/:id",
    name: "preview",
    component: ImagePreview,
    props: true,
    meta: { requiresAuth: true },
  },
  {
    path: "/upload",
    name: "upload",
    component: UploadView,
    meta: { requiresAuth: true },
  },
  {
    path: "/recommend",
    name: "recommend",
    component: RecommendView,
    meta: { requiresAuth: true },
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
    meta: { guest: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DataDashboardView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  // 需要管理员权限的页面
  if (to.matched.some((record) => record.meta.requiresAdmin)) {
    const authStore = useAuthStore();
    if (!authStore.isAdmin) {
      // 没有管理员权限，重定向到首页
      return next('/');
    }
  }

  // 需要认证但未登录
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    next("/login");
  }
  // 已登录用户访问登录页面
  else if (to.matched.some((record) => record.meta.guest) && isAuthenticated) {
    next("/");
  }
  // 其他情况正常导航
  else {
    next();
  }
});

export default router;
