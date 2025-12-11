<template>
  <div class="app-layout">
    <aside class="sidebar">
      <div class="logo-area">
        <el-icon :size="28" color="#fff" style="margin-right: 8px"><DocumentChecked /></el-icon>
        <transition name="fade-logo">
          <h1 class="app-title" v-if="!isCollapse">SmartDoc</h1>
        </transition>
      </div>

      <el-menu
        active-text-color="#409EFF"
        background-color="#001529"
        text-color="#b0b8bf"
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <el-menu-item index="/stats">
          <el-icon><PieChart /></el-icon>
          <template #title>数据报表 (Stats)</template>
        </el-menu-item>

        <el-menu-item index="/upload">
          <el-icon><UploadFilled /></el-icon>
          <template #title>智能归档 (Upload)</template>
        </el-menu-item>

        <el-menu-item index="/list">
          <el-icon><List /></el-icon>
          <template #title>归档记录 (List)</template>
        </el-menu-item>

        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>AI 财务顾问 (Chat)</template>
        </el-menu-item>

        <el-menu-item index="/budget">
          <el-icon><Wallet /></el-icon>
          <template #title>预算中心 (Budget)</template>
        </el-menu-item>

        <el-menu-item index="/calendar">
          <el-icon><Calendar /></el-icon>
          <template #title>财务日历 (Calendar)</template>
        </el-menu-item>

        <el-menu-item index="/graph">
          <el-icon><Connection /></el-icon>
          <template #title>消费图谱 (Graph)</template>
        </el-menu-item>

        <el-menu-item index="/analysis">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>聚类分析 (AI)</template>
        </el-menu-item>

        <el-menu-item index="/recycle">
          <el-icon><DocumentChecked /></el-icon>
          <template #title>回收站 (Recycle Bin)</template>
        </el-menu-item>

        <el-menu-item index="/approval" v-if="currentUser.role === 'admin'">
          <el-icon><Stamp /></el-icon>
          <template #title>审批工作台 (Approval)</template>
        </el-menu-item>

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置 (Settings)</template>
        </el-menu-item>
      </el-menu>

      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon :size="20">
          <component :is="isCollapse ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-header">
        <div class="breadcrumb">
          <span class="crumb-label">当前位置：</span>
          <span class="crumb-value">{{ currentTitle }}</span>
        </div>

        <el-dropdown @command="handleCommand" trigger="click">
          <div class="user-info">
            <el-avatar
              :size="32"
              src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            />
            <span class="username">{{
              currentUser.nickname || currentUser.username || '未登录'
            }}</span>
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout" style="color: #f56c6c"
                >退出登录</el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </header>

      <div class="router-view-box">
        <router-view v-slot="{ Component }">
          <transition name="fade-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
/**
 * App.vue - 应用根组件
 *
 * 功能概述:
 * 1. 定义全局布局结构 (侧边栏 + 主内容区)
 * 2. 实现导航菜单和路由切换
 * 3. 管理用户登录状态和退出登录功能
 */

// --- Vue 核心 API 导入 ---
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DocumentChecked,
  UploadFilled,
  List,
  PieChart,
  ChatDotRound,
  Wallet,
  ArrowDown,
  Calendar,
  Setting,
  Connection,
  Stamp,
  DataAnalysis,
  Expand,
  Fold,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 类型定义 ---
/** 用户信息接口 */
interface UserInfo {
  id?: number // 用户 ID
  username?: string // 用户名 (登录账号)
  nickname?: string // 昵称 (显示名称)
  role?: string // 用户角色 (如 'admin'、'user')
}

// --- 路由实例 ---
const route = useRoute() // 当前路由信息 (响应式)
const router = useRouter() // 路由导航实例

// --- 响应式状态 ---
const isCollapse = ref(false) // 侧边栏是否折叠
const currentUser = ref<UserInfo>({}) // 当前登录用户信息

/**
 * 从 LocalStorage 加载用户信息
 *
 * 尝试解析存储的 JSON 格式用户数据
 * 如果解析失败则重置为空对象
 */
const loadUserInfo = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr)
    } catch (e) {
      console.error('用户信息解析失败', e)
      currentUser.value = {}
    }
  } else {
    currentUser.value = {}
  }
}

/**
 * 组件挂载完成时执行
 * 初始化加载用户信息
 */
onMounted(() => {
  loadUserInfo()
})

/**
 * 监听路由变化
 *
 * 作用: 解决登录成功后跳转时用户名不更新的问题
 * 每次路由变化时重新加载用户信息
 */
watch(
  () => route.path,
  () => {
    loadUserInfo()
  },
)

/**
 * 计算属性: 当前激活的菜单项
 * 根据当前路由路径高亮对应的侧边栏菜单
 */
const activeMenu = computed(() => route.path)

/**
 * 计算属性: 当前页面标题
 * 根据路由路径返回对应的中文标题，用于面包屑导航显示
 */
const currentTitle = computed(() => {
  if (route.path === '/upload') return '智能归档助手'
  if (route.path === '/list') return '历史归档列表'
  if (route.path === '/stats') return '数据报表'
  if (route.path === '/chat') return 'AI 财务顾问'
  if (route.path === '/budget') return '预算控制中心'
  if (route.path === '/profile') return '个人中心'
  return 'SmartDoc'
})

/**
 * 切换侧边栏折叠状态
 */
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

/**
 * 处理用户下拉菜单命令
 *
 * @param command - 菜单命令标识 ('logout' | 'profile')
 */
const handleCommand = (command: string) => {
  if (command === 'logout') {
    // 退出登录: 弹出确认框
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      // 清除本地存储的登录信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.success('已安全退出')
      // 跳转到登录页
      router.push('/login')
    })
  } else if (command === 'profile') {
    // 跳转到个人中心页面
    router.push('/profile')
  }
}
</script>

<style>
/* 全局样式 */
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', sans-serif;
}
#app {
  width: 100%;
  height: 100%;
}
</style>

<style scoped>
/* ========================================
   MAIN LAYOUT
   ======================================== */

.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: var(--color-background);
  overflow: hidden;
}

/* ========================================
   SIDEBAR - Enhanced with Gradients
   ======================================== */

.sidebar {
  background: linear-gradient(180deg, #001529 0%, #002140 50%, #001529 100%);
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  width: v-bind('isCollapse ? "64px" : "220px"');
  flex-shrink: 0;
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-lg);
  position: relative;
}

/* Animated gradient overlay */
.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(24, 144, 255, 0.1) 0%,
    rgba(114, 46, 209, 0.05) 100%
  );
  pointer-events: none;
  opacity: 0.5;
}

.logo-area {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #002140 0%, #003a70 100%);
  color: var(--color-white);
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.logo-area::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}

.app-title {
  font-size: 18px;
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  margin: 0;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Menu Styles - Enhanced Animations */
.el-menu-vertical {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
}

.el-menu-vertical::-webkit-scrollbar {
  width: 0;
}

/* Enhanced menu item styles */
:deep(.el-menu-item) {
  position: relative;
  transition: all var(--transition-base);
  margin: 4px 8px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

:deep(.el-menu-item::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-primary);
  transform: scaleY(0);
  transition: transform var(--transition-base);
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
  transform: translateX(4px);
}

:deep(.el-menu-item:hover::before) {
  transform: scaleY(1);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(24, 144, 255, 0.2), rgba(24, 144, 255, 0.05)) !important;
  color: var(--color-primary-lighter) !important;
  font-weight: var(--font-weight-semibold);
}

:deep(.el-menu-item.is-active::before) {
  transform: scaleY(1);
}

/* Icon animations */
:deep(.el-menu-item .el-icon) {
  transition: transform var(--transition-base);
}

:deep(.el-menu-item:hover .el-icon) {
  transform: scale(1.1) rotate(5deg);
}

/* Collapse button */
.collapse-btn {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  cursor: pointer;
  background: linear-gradient(135deg, #002140 0%, #001529 100%);
  transition: all var(--transition-base);
  position: relative;
  z-index: 1;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.collapse-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.collapse-btn:hover {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  box-shadow: 0 -4px 12px rgba(24, 144, 255, 0.3);
}

.collapse-btn:active {
  transform: scale(0.95);
}

/* ========================================
   MAIN CONTENT AREA
   ======================================== */

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

/* Top Header - Glassmorphism Effect */
.top-header {
  height: 64px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-lg);
  flex-shrink: 0;
  z-index: var(--z-sticky);
  border-bottom: 1px solid var(--color-border-light);
  position: relative;
}

.top-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    var(--color-primary-light),
    transparent
  );
  opacity: 0.3;
}

/* Breadcrumb - Enhanced Styling */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  animation: fadeInDown 0.4s ease-out;
}

.crumb-label {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.crumb-value {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  position: relative;
  padding-bottom: 2px;
}

.crumb-value::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-base);
}

.breadcrumb:hover .crumb-value::after {
  transform: scaleX(1);
}

/* User Info - Enhanced Dropdown */
.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  cursor: pointer;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-lg);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.user-info::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light));
  opacity: 0;
  transition: opacity var(--transition-base);
}

.user-info:hover {
  background: var(--color-gray-50);
  box-shadow: var(--shadow-sm);
  transform: translateY(-1px);
}

.user-info:hover::before {
  opacity: 0.1;
}

.user-info:active {
  transform: translateY(0);
}

:deep(.el-avatar) {
  border: 2px solid var(--color-white);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
}

.user-info:hover :deep(.el-avatar) {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.1);
}

.username {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

/* Router View Container */
.router-view-box {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--space-lg);
  box-sizing: border-box;
  scroll-behavior: smooth;
  background: var(--color-background);
}

/* ========================================
   PAGE TRANSITIONS - Enhanced Animations
   ======================================== */

/* Logo fade transition */
.fade-logo-enter-active,
.fade-logo-leave-active {
  transition: opacity var(--transition-base);
}

.fade-logo-enter-from,
.fade-logo-leave-to {
  opacity: 0;
}

/* Page transition - Smooth fade and slide */
.fade-page-enter-active {
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-page-leave-active {
  animation: fadeOut 0.3s cubic-bezier(0.4, 0, 1, 1);
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: var(--z-modal);
  }

  .top-header {
    padding: 0 var(--space-md);
  }

  .router-view-box {
    padding: var(--space-md);
  }
}
</style>
