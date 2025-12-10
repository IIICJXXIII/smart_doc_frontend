import { createRouter, createWebHistory } from 'vue-router'
import SmartUploader from '../views/SmartUploader.vue'
const DocList = () => import('../views/DocList.vue')
const StatsDashboard = () => import('../views/StatsDashboard.vue')
const Login = () => import('../views/Login.vue') // 引入登录页
const Register = () => import('../views/Register.vue')
const ChatAssistant = () => import('../views/ChatAssistant.vue')
const BudgetCenter = () => import('../views/BudgetCenter.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/upload' },
    { path: '/login', name: 'login', component: Login }, // 登录路由
    { path: '/register', name: 'register', component: Register },
    { path: '/upload', name: 'upload', component: SmartUploader },
    { path: '/list', name: 'list', component: DocList },
    { path: '/stats', name: 'stats', component: StatsDashboard },
    { path: '/chat', name: 'chat', component: ChatAssistant },
    { path: '/budget', name: 'budget', component: BudgetCenter },
  ],
})

const whiteList = ['/login', '/register']

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  // 1. 如果要去的地方在白名单里 (比如登录页、注册页)，直接放行
  if (whiteList.includes(to.path)) {
    next()
  }
  // 2. 如果要去的地方不在白名单 (是受保护的页面)，但没有 Token
  else if (!token) {
    next('/login') // 强制踢回登录页
  }
  // 3. 有 Token，或者去的是白名单页面 -> 放行
  else {
    next()
  }
})

export default router
