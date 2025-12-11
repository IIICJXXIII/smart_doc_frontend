<!--
  Login.vue
  用户登录页面组件

  本组件提供了一个用户登录界面，包括：
  - 左侧的品牌信息展示区，包含应用名称和标语。
  - 右侧的登录表单，用户可在此输入账号和密码。
  - 表单下方提供“立即登录”按钮和跳转到注册页面的链接。
-->
<template>
  <!-- 根容器，负责全屏背景和居中布局 -->
  <div class="login-container">
    <!-- 登录框主体，包含左右两个部分 -->
    <div class="login-box">
      <!-- 左侧品牌展示区 -->
      <div class="left-side">
        <!-- 标题和图标 -->
        <div class="title-box">
          <el-icon :size="40" color="#fff"><DocumentChecked /></el-icon>
          <h1>SmartDoc</h1>
        </div>
        <!-- 应用标语 -->
        <p class="slogan">智能票据归档 · 高效财务管理</p>
      </div>

      <!-- 右侧登录表单区 -->
      <div class="right-side">
        <h2>欢迎登录</h2>
        <!-- Element Plus 表单组件 -->
        <el-form :model="loginForm" label-position="top" size="large">
          <!-- 账号输入框 -->
          <el-form-item label="账号">
            <el-input v-model="loginForm.username" prefix-icon="User" placeholder="admin" />
          </el-form-item>

          <!-- 密码输入框 -->
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

          <!-- 登录按钮 -->
          <el-button type="primary" class="login-btn" :loading="loading" @click="handleLogin">
            立即登录
          </el-button>

          <!-- 注册链接区域 -->
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
 * @file Login.vue - 用户登录页面脚本
 * @description 该脚本负责处理用户登录的逻辑，包括表单数据绑定、API 请求发送、
 *              登录状态管理以及成功后的页面跳转。
 */

// --- 依赖导入 ---
import { reactive, ref } from 'vue' // 导入 Vue 3 的响应式 API
import { useRouter } from 'vue-router' // 导入 Vue Router 的路由实例钩子
import { DocumentChecked, User, Lock } from '@element-plus/icons-vue' // 导入 Element Plus 图标
import { ElMessage } from 'element-plus' // 导入 Element Plus 的消息提示组件
import axios from 'axios' // 导入 Axios 用于 HTTP 请求

// --- 响应式状态定义 ---

const router = useRouter() // 获取路由实例，用于页面跳转
const loading = ref(false) // 定义一个 ref 变量，控制登录按钮的加载状态，初始为 false

// 使用 reactive 创建一个响应式对象来存储登录表单的数据
const loginForm = reactive({
  username: '', // 用户名
  password: ''  // 密码
})

// --- 方法定义 ---

/**
 * @function handleLogin
 * @description 处理用户登录的核心函数。
 * @async
 * 
 * @steps
 * 1. **表单校验**: 检查用户名和密码是否已填写。
 * 2. **发起请求**: 设置加载状态，并向后端发送 POST 登录请求。
 * 3. **响应处理**:
 *    - **成功 (code === 200)**: 显示成功消息，将返回的 token 和用户信息存储到 localStorage，然后跳转到主页 ('/upload')。
 *    - **失败**: 显示后端返回的错误信息。
 * 4. **异常捕获**: 捕获网络或服务器错误，并显示通用错误消息。
 * 5. **结束加载**: 无论成功、失败还是异常，最终都会关闭加载状态。
 */
const handleLogin = async () => {
  // 1. 表单基础校验
  if (!loginForm.username || !loginForm.password) {
    return ElMessage.warning('请输入账号和密码')
  }

  loading.value = true // 开始加载，禁用登录按钮
  try {
    // 2. 发送 POST 请求到后端登录接口
    const res = await axios.post('http://localhost:8080/api/user/login', loginForm)

    // 3. 根据后端返回的 code 判断登录结果
    if (res.data.code === 200) {
      ElMessage.success('登录成功')

      // 将 token 和用户信息存入浏览器的 localStorage，用于持久化登录状态和后续 API 请求验证
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))

      // 登录成功后跳转到文件上传页面
      router.push('/upload')
    } else {
      // 如果 code 不是 200，则认为登录失败，显示后端提供的错误消息
      ElMessage.error(res.data.msg || '登录失败，请检查账号或密码')
    }
  } catch (error) {
    // 4. 捕获请求过程中的错误（如网络问题、服务器崩溃等）
    console.error('登录请求失败:', error)
    ElMessage.error('服务器连接异常，请稍后再试')
  } finally {
    // 5. 无论请求结果如何，最终都将加载状态置为 false
    loading.value = false
  }
}
</script>

<!--
  Scoped CSS
  - `scoped` 属性确保这些样式只应用于当前组件，避免全局样式污染。
-->
<style scoped>
/* 登录页面的主容器，设置全屏渐变背景和flex布局实现内容居中 */
.login-container {
  height: 100vh; /* 视图高度100% */
  width: 100vw; /* 视图宽度100% */
  background: linear-gradient(135deg, #001529 0%, #003a70 100%); /* 深蓝色渐变背景 */
  display: flex;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
}

/* 登录框的样式，定义尺寸、背景、圆角和阴影 */
.login-box {
  width: 800px;
  height: 500px;
  background: #fff; /* 白色背景 */
  border-radius: 16px; /* 圆角 */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3); /* 立体阴影效果 */
  display: flex;
  overflow: hidden; /* 隐藏溢出的子元素，确保圆角效果 */
}

/* 左侧品牌信息区域的样式 */
.left-side {
  flex: 1; /* 占据一半宽度 */
  background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%); /* 蓝色渐变背景 */
  display: flex;
  flex-direction: column; /* 垂直排列子元素 */
  align-items: center;
  justify-content: center;
  color: #fff; /* 文字颜色为白色 */
}

/* 标题容器 */
.title-box {
  display: flex;
  align-items: center;
  gap: 10px; /* 元素间距 */
  margin-bottom: 20px;
}

/* 标题文字样式 */
.title-box h1 {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

/* 标语文字样式 */
.slogan {
  font-size: 16px;
  opacity: 0.8; /* 轻微透明 */
  letter-spacing: 2px; /* 字符间距 */
}

/* 右侧登录表单区域的样式 */
.right-side {
  flex: 1; /* 占据另一半宽度 */
  padding: 60px; /* 内边距 */
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* “欢迎登录”标题样式 */
.right-side h2 {
  margin-bottom: 30px;
  color: #333;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  margin-top: 20px;
  font-weight: bold;
}

/* 底部链接区域容器 */
.link-area {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
  display: flex;
  justify-content: center;
  gap: 5px;
}
</style>