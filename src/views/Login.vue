<template>
  <div class="login-container">
    <div class="login-box">
      <div class="left-side">
        <div class="title-box">
          <el-icon :size="40" color="#fff"><DocumentChecked /></el-icon>
          <h1>SmartDoc</h1>
        </div>
        <p class="slogan">智能票据归档 · 高效财务管理</p>
      </div>

      <div class="right-side">
        <h2>欢迎登录</h2>
        <el-form :model="loginForm" label-position="top" size="large">
          <el-form-item label="账号">
            <el-input v-model="loginForm.username" prefix-icon="User" placeholder="admin" />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="loginForm.password"
              prefix-icon="Lock"
              type="password"
              placeholder="123456"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            立即登录
          </el-button>

          <div class="link-area">
            <span>还没有账号？</span>
            <el-link type="primary" @click="$router.push('/register')">立即注册</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Login.vue - 用户登录页面
 *
 * 功能概述:
 * 1. 提供用户名密码输入表单
 * 2. 调用后端登录接口验证身份
 * 3. 登录成功后存储 Token 并跳转到主页
 */

import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DocumentChecked, User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// --- 路由和状态 ---
const router = useRouter() // 路由导航实例
const loading = ref(false) // 登录按钮加载状态

// 登录表单数据 (响应式对象)
const loginForm = reactive({ username: '', password: '' })

/**
 * 处理登录请求
 *
 * 流程:
 * 1. 表单验证 - 检查用户名密码是否填写
 * 2. 发送请求 - 调用后端登录 API
 * 3. 处理响应 - 存储 Token 并跳转
 */
const handleLogin = async () => {
  // 表单验证: 账号密码不能为空
  if (!loginForm.username || !loginForm.password) {
    return ElMessage.warning('请输入账号和密码')
  }

  loading.value = true
  try {
    // 发送登录请求到后端 API
    const res = await axios.post('http://localhost:8080/api/user/login', loginForm)

    if (res.data.code === 200) {
      // 登录成功
      ElMessage.success('登录成功')

      // 核心: 将 Token 和用户信息存入 LocalStorage
      // Token 用于后续请求的身份验证
      localStorage.setItem('token', res.data.token)
      // 用户信息用于界面显示
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // 跳转到上传页面 (主页)
      router.push('/upload')
    } else {
      // 登录失败: 显示后端返回的错误信息
      ElMessage.error(res.data.msg || '登录失败')
    }
  } catch (error) {
    // 网络错误或服务器异常
    console.error(error)
    ElMessage.error('服务器连接失败')
  } finally {
    // 无论成功失败，都关闭加载状态
    loading.value = false
  }
}
</script>

<style scoped>
/* ========================================
   LOGIN CONTAINER - Animated Gradient
   ======================================== */

.login-container {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Animated background particles */
.login-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: particleFloat 20s linear infinite;
}

@keyframes particleFloat {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

/* ========================================
   LOGIN BOX - Glassmorphism Card
   ======================================== */

.login-box {
  width: 900px;
  height: 550px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl), 0 0 0 1px rgba(255, 255, 255, 0.3);
  display: flex;
  overflow: hidden;
  position: relative;
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.login-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: var(--radius-2xl);
  padding: 2px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* ========================================
   LEFT SIDE - Brand Section
   ======================================== */

.left-side {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  position: relative;
  overflow: hidden;
}

.left-side::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent 70%);
  animation: rotate 30s linear infinite;
}

.title-box {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
  position: relative;
  z-index: 1;
  animation: fadeInDown 0.6s ease-out 0.2s both;
}

.title-box :deep(.el-icon) {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  animation: bounce 2s ease-in-out infinite;
}

.title-box h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.slogan {
  font-size: var(--font-size-lg);
  opacity: 0.95;
  letter-spacing: 3px;
  position: relative;
  z-index: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

/* ========================================
   RIGHT SIDE - Form Section
   ======================================== */

.right-side {
  flex: 1;
  padding: var(--space-3xl);
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: var(--color-white);
  position: relative;
}

.right-side h2 {
  margin-bottom: var(--space-xl);
  color: var(--color-text-primary);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: fadeInRight 0.6s ease-out 0.3s both;
}

/* Form Styles */
:deep(.el-form) {
  animation: fadeInUp 0.6s ease-out 0.5s both;
}

:deep(.el-form-item) {
  margin-bottom: var(--space-lg);
}

:deep(.el-form-item__label) {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

/* Enhanced Input Styles */
:deep(.el-input__wrapper) {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  border: 2px solid transparent;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: var(--shadow-md);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

:deep(.el-input__inner) {
  font-size: var(--font-size-base);
  padding: var(--space-sm) var(--space-md);
}

/* Enhanced Button */
.login-btn {
  width: 100%;
  margin-top: var(--space-lg);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  border: none;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width var(--transition-slow), height var(--transition-slow);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-btn:hover::before {
  width: 400px;
  height: 400px;
}

.login-btn:active {
  transform: translateY(0);
}

/* Link Area */
.link-area {
  margin-top: var(--space-lg);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-xs);
}

:deep(.el-link) {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

:deep(.el-link:hover) {
  transform: translateX(2px);
}

/* ========================================
   ANIMATIONS
   ======================================== */

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

@media (max-width: 900px) {
  .login-box {
    width: 90%;
    height: auto;
    flex-direction: column;
  }

  .left-side {
    padding: var(--space-2xl) var(--space-lg);
    min-height: 200px;
  }

  .right-side {
    padding: var(--space-2xl) var(--space-lg);
  }

  .title-box h1 {
    font-size: var(--font-size-2xl);
  }

  .slogan {
    font-size: var(--font-size-base);
  }
}
</style>
