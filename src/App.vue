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
        <el-menu-item index="/upload">
          <el-icon><UploadFilled /></el-icon>
          <template #title>智能归档 (Upload)</template>
        </el-menu-item>

        <el-menu-item index="/list">
          <el-icon><List /></el-icon>
          <template #title>归档记录 (List)</template>
        </el-menu-item>

        <el-menu-item index="/stats">
          <el-icon><PieChart /></el-icon>
          <template #title>数据报表 (Stats)</template>
        </el-menu-item>

        <el-menu-item index="/chat">
          <el-icon><ChatDotRound /></el-icon>
          <template #title>AI 财务顾问 (Chat)</template>
        </el-menu-item>

        <el-menu-item index="/budget">
          <el-icon><Wallet /> </el-icon> <template #title>预算中心 (Budget)</template>
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
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile" disabled>个人中心</el-dropdown-item>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router' // 引入 useRouter
import {
  DocumentChecked,
  UploadFilled,
  List,
  PieChart,
  ArrowDown,
  Expand,
  Fold,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Register icons for dynamic component usage
const Expand_ = Expand
const Fold_ = Fold
void Expand_
void Fold_

interface UserInfo {
  id?: number
  username?: string
  nickname?: string
}

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)
const currentUser = ref<UserInfo>({}) // 存储用户信息

// 从 LocalStorage 读取用户信息的函数
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

// 1. 初始化时读取用户信息
onMounted(() => {
  loadUserInfo()
})

// 2. 监听路由变化，重新加载用户信息（登录后跳转时触发）
watch(
  () => route.path,
  () => {
    loadUserInfo()
  },
)

const activeMenu = computed(() => route.path)

const currentTitle = computed(() => {
  if (route.path === '/upload') return '智能归档助手'
  if (route.path === '/list') return '历史归档列表'
  if (route.path === '/stats') return '数据报表'
  return 'SmartDoc'
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 2. 处理下拉菜单点击事件
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      // 执行登出逻辑
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.success('已安全退出')
      // 跳转回登录页
      router.push('/login')
    })
  }
}
</script>

<style>
/* CSS 部分保持不变 */
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
/* 布局样式保持不变 */
.app-layout {
  display: flex;
  width: 100vw;
  height: 100vh;
  background-color: #f0f2f5;
  overflow: hidden;
}
.sidebar {
  background-color: #001529;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  width: v-bind('isCollapse ? "64px" : "220px"');
  flex-shrink: 0;
  z-index: 10;
}
.logo-area {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #002140;
  color: #fff;
  overflow: hidden;
}
.app-title {
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  margin: 0;
}
.el-menu-vertical {
  border-right: none;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}
.el-menu-vertical::-webkit-scrollbar {
  width: 0;
}
.collapse-btn {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  background: #002140;
}
.collapse-btn:hover {
  background: #1890ff;
}

/* 右侧主体 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

.top-header {
  height: 64px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
  z-index: 9;
}

.crumb-label {
  color: #909399;
  font-size: 14px;
}
.crumb-value {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

/* 用户信息区域样式优化 */
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.3s;
}
.user-info:hover {
  background: #f5f5f5;
}
.username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.router-view-box {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  box-sizing: border-box;
  scroll-behavior: smooth;
}

/* 动画 */
.fade-logo-enter-active,
.fade-logo-leave-active {
  transition: opacity 0.2s;
}
.fade-logo-enter-from,
.fade-logo-leave-to {
  opacity: 0;
}
.fade-page-enter-active {
  transition: all 0.3s ease-out;
}
.fade-page-leave-active {
  transition: all 0.2s ease-in;
}
.fade-page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
