<!--
  Register.vue
  用户注册页面组件

  本组件为新用户提供注册功能，包含：
  - 与登录页一致的左侧品牌信息展示区。
  - 右侧的注册表单，包含用户名、昵称、密码和确认密码输入框。
  - 表单验证逻辑，确保输入数据的有效性。
  - “立即注册”按钮和返回登录页的链接。
-->
<template>
  <!-- 根容器，样式与登录页保持一致，提供统一的视觉体验 -->
  <div class="login-container">
    <!-- 注册框主体 -->
    <div class="login-box">
      <!-- 左侧品牌展示区 -->
      <div class="left-side">
        <div class="title-box">
          <el-icon :size="40" color="#fff"><DocumentChecked /></el-icon>
          <h1>SmartDoc</h1>
        </div>
        <p class="slogan">加入我们 · 开启智能财务之旅</p>
      </div>

      <!-- 右侧注册表单区 -->
      <div class="right-side">
        <h2>创建账号</h2>
        <!-- Element Plus 表单，绑定了模型、验证规则和引用 -->
        <el-form
          :model="registerForm"
          :rules="rules"
          ref="formRef"
          label-position="top"
          size="large"
        >
          <!-- 用户名输入项 -->
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              prefix-icon="User"
              placeholder="请输入用户名 (唯一)"
            />
          </el-form-item>

          <!-- 昵称输入项 -->
          <el-form-item label="昵称" prop="nickname">
            <el-input
              v-model="registerForm.nickname"
              prefix-icon="Postcard"
              placeholder="例如：财务小李"
            />
          </el-form-item>

          <!-- 密码输入项 -->
          <el-form-item label="设置密码" prop="password">
            <el-input
              v-model="registerForm.password"
              prefix-icon="Lock"
              type="password"
              placeholder="6位以上字符"
              show-password
            />
          </el-form-item>

          <!-- 确认密码输入项 -->
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              prefix-icon="Key"
              type="password"
              placeholder="请再次输入密码"
              show-password
            />
          </el-form-item>

          <!-- 注册按钮 -->
          <el-button type="success" class="submit-btn" :loading="loading" @click="handleRegister">
            立即注册
          </el-button>

          <!-- 返回登录链接 -->
          <div class="link-area">
            <span>已有账号？</span>
            <el-link type="primary" @click="$router.push('/login')">去登录</el-link>
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file Register.vue - 用户注册页面脚本
 * @description 负责处理用户注册的全部逻辑，包括表单数据管理、输入验证、
 *              与后端API的交互以及注册成功后的导航。
 */

// --- 依赖导入 ---
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { DocumentChecked, User, Lock, Key, Postcard } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance } from 'element-plus' // FormInstance 用于类型定义
import axios from 'axios'

// --- 响应式状态定义 ---

const router = useRouter() // 获取路由实例，用于页面跳转
const loading = ref(false) // 控制注册按钮的加载状态
const formRef = ref<FormInstance>() // 创建一个表单引用，用于访问表单实例方法（如 validate）

// 使用 reactive 创建注册表单的数据模型
const registerForm = reactive({
  username: '',        // 用户名 (必须唯一)
  nickname: '',        // 用户昵称 (用于显示)
  password: '',        // 密码
  confirmPassword: '', // 确认密码字段，用于验证
})

// --- 表单验证规则 ---

/**
 * @description 自定义验证函数，用于检查两次输入的密码是否一致。
 * @param rule - 验证规则对象 (未使用)
 * @param value - 当前输入框的值 (确认密码)
 * @param callback - 验证完成后的回调函数
 */
const validatePass = (rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback() // 验证通过
  }
}

// 定义 Element Plus 表单的验证规则对象
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePass, trigger: 'blur' }, // 使用自定义验证器
  ],
}

// --- 方法定义 ---

/**
 * @function handleRegister
 * @description 处理用户注册提交的核心函数。
 * @async
 * 
 * @steps
 * 1. **获取表单实例**: 确保表单已正确挂载。
 * 2. **触发表单验证**: 调用 Element Plus 表单的 `validate` 方法。
 * 3. **验证通过后**:
 *    a. 开启加载状态。
 *    b. 从表单数据中排除 `confirmPassword` 字段，因为它不需要发送给后端。
 *    c. 发送 POST 请求到后端注册接口。
 *    d. **成功 (code === 200)**: 显示成功消息，并导航到登录页面。
 *    e. **失败**: 显示后端返回的错误信息（例如，用户名已存在）。
 * 4. **异常处理**: 捕获并处理网络或服务器错误。
 * 5. **结束加载**: 在 `finally` 块中确保加载状态被重置。
 */
const handleRegister = async () => {
  if (!formRef.value) return // 防御性编程，确保 formRef 存在

  // 触发表单的全部验证规则
  await formRef.value.validate(async (valid) => {
    if (valid) { // 如果验证通过
      loading.value = true
      try {
        // 使用对象解构排除 `confirmPassword`，只将需要的数据发送给后端
        const { confirmPassword, ...postData } = registerForm
        const res = await axios.post('http://localhost:8080/api/user/register', postData)

        if (res.data.code === 200) {
          ElMessage.success('注册成功！现在您可以登录了。')
          router.push('/login') // 注册成功，跳转到登录页
        } else {
          ElMessage.error(res.data.msg || '注册失败，请稍后再试')
        }
      } catch (error) {
        console.error('注册请求失败:', error)
        ElMessage.error('服务器连接失败')
      } finally {
        loading.value = false // 结束加载状态
      }
    }
  })
}
</script>

<!--
  Scoped CSS
  - 大部分样式复用自 Login.vue 以保持 UI 一致性。
  - 针对注册页面的表单尺寸进行了微调。
-->
<style scoped>
/* 容器和背景样式，与登录页完全相同 */
.login-container {
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #001529 0%, #003a70 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 注册框尺寸调整，比登录框稍大以容纳更多表单项 */
.login-box {
  width: 900px;
  height: 600px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  display: flex;
  overflow: hidden;
}

/* 左侧品牌区域布局和样式，与登录页相同 */
.left-side {
  flex: 4; /* 调整 flex 比例，使左侧稍窄 */
  background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.title-box h1 {
  font-size: 32px;
  font-weight: bold;
  margin: 0;
}

.slogan {
  font-size: 16px;
  opacity: 0.8;
  letter-spacing: 2px;
}

/* 右侧表单区域布局和样式 */
.right-side {
  flex: 5; /* 调整 flex 比例，使右侧稍宽 */
  padding: 40px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.right-side h2 {
  margin-bottom: 20px;
  color: #333;
  font-size: 24px;
}

/* 注册按钮样式 */
.submit-btn {
  width: 100%;
  margin-top: 10px;
  font-weight: bold;
  height: 44px;
}

/* 底部链接区域样式 */
.link-area {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}
</style>