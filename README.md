# 🧾 SmartDoc Frontend - 智能票据归档助手

[![Vue](https://img.shields.io/badge/Vue-3.5.25-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.0-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.4-646CFF.svg)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.12.0-409EFF.svg)](https://element-plus.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> 基于 **Vue 3 + TypeScript + Vite + Element Plus** 构建的现代化财务票据智能管理系统前端应用

---

## 📖 项目简介

SmartDoc Frontend 是一款智能票据归档助手的前端项目，提供直观的用户界面用于票据上传、智能识别、归档管理和数据可视化分析。系统采用现代化的前端技术栈，支持拖拽上传、AI 自动识别、多维度数据统计等功能，旨在提升财务票据管理效率。

### ✨ 核心功能特性

- 🚀 **智能上传识别**：支持拖拽/点击上传票据图片，AI 自动识别票据信息
- 📊 **数据可视化统计**：基于 ECharts 的多维度数据报表展示
- 📝 **归档记录管理**：查看、编辑、删除历史归档记录
- 🔐 **用户认证系统**：完整的登录注册和基于 Token 的权限控制
- 💬 **AI 财务顾问**：智能对话助手提供财务建议
- 📅 **财务日历**：可视化财务事件时间线
- 🎯 **预算管理**：预算设置与支出控制中心
- 🗑️ **回收站功能**：支持数据恢复的软删除机制
- ✅ **审批中心**：多级审批流程管理
- 🔍 **知识图谱**：财务数据关联关系可视化

---

## 🛠️ 技术栈

### 核心依赖

| 技术 | 版本 | 说明 |
|------|------|------|
| [Vue](https://vuejs.org/) | ^3.5.25 | 渐进式 JavaScript 框架 |
| [TypeScript](https://www.typescriptlang.org/) | ~5.9.0 | JavaScript 的超集，提供类型安全 |
| [Vite](https://vitejs.dev/) | ^7.2.4 | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | ^4.6.3 | Vue.js 官方路由管理器 |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.4 | Vue.js 官方状态管理库 |
| [Element Plus](https://element-plus.org/) | ^2.12.0 | 基于 Vue 3 的组件库 |
| [@element-plus/icons-vue](https://element-plus.org/zh-CN/component/icon.html) | ^2.3.2 | Element Plus 图标库 |
| [Axios](https://axios-http.com/) | ^1.13.2 | 基于 Promise 的 HTTP 客户端 |
| [ECharts](https://echarts.apache.org/) | ^6.0.0 | 强大的数据可视化图表库 |
| [UUID](https://www.npmjs.com/package/uuid) | ^13.0.0 | 唯一标识符生成器 |

### 开发工具链

- **代码规范**：ESLint + Prettier
- **类型检查**：Vue TSC
- **构建工具**：Vite 7.x
- **开发插件**：Vue Devtools

---

## 📋 环境要求

| 环境 | 版本要求 |
|------|----------|
| **Node.js** | `^20.19.0 || >=22.12.0` |
| **npm** | 7.0+ |

> **注意**：请确保您的 Node.js 版本符合要求，建议使用 [nvm](https://github.com/nvm-sh/nvm) 或 [nvm-windows](https://github.com/coreybutler/nvm-windows) 管理 Node.js 版本。

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/IIICJXXIII/smart_doc_frontend.git
cd smart_doc_frontend
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

开发服务器将在 [http://localhost:5173](http://localhost:5173) 启动。

### 4. 构建生产版本

```bash
npm run build
```

构建完成后，生成的文件将输出到 `dist/` 目录。

### 5. 预览生产构建

```bash
npm run preview
```

---

## 📜 可用脚本

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（热重载） |
| `npm run build` | 构建生产版本（类型检查 + 打包） |
| `npm run build-only` | 仅打包构建（跳过类型检查） |
| `npm run type-check` | TypeScript 类型检查 |
| `npm run preview` | 预览生产构建结果 |
| `npm run lint` | ESLint 代码检查并自动修复 |
| `npm run format` | Prettier 代码格式化 |

---

## 📂 项目结构

```
smart_doc_frontend/
├── public/                      # 静态资源目录（不经过编译）
├── src/                         # 源代码目录
│   ├── assets/                  # 静态资源（CSS、图片等）
│   ├── components/              # 可复用组件
│   ├── router/                  # 路由配置
│   │   └── index.ts             # 路由守卫 & 路由表
│   ├── stores/                  # Pinia 状态管理
│   ├── views/                   # 页面组件
│   │   ├── Login.vue            # 登录页
│   │   ├── Register.vue         # 注册页
│   │   ├── SmartUploader.vue    # 智能上传识别页
│   │   ├── DocList.vue          # 归档记录列表
│   │   ├── StatsDashboard.vue   # 数据统计看板
│   │   ├── ChatAssistant.vue    # AI 财务顾问
│   │   ├── BudgetCenter.vue     # 预算控制中心
│   │   ├── UserProfile.vue      # 个人中心
│   │   ├── FinanceCalendar.vue  # 财务日历
│   │   ├── SystemSettings.vue   # 系统设置
│   │   ├── KnowledgeGraph.vue   # 知识图谱
│   │   ├── RecycleBin.vue       # 回收站
│   │   └── ApprovalCenter.vue   # 审批中心
│   ├── App.vue                  # 根组件（侧边栏 + 路由出口）
│   ├── main.ts                  # 应用入口（Axios 拦截器配置）
│   └── env.d.ts                 # TypeScript 类型声明
├── index.html                   # HTML 模板
├── vite.config.ts               # Vite 配置文件
├── tsconfig.json                # TypeScript 配置
├── eslint.config.ts             # ESLint 配置
├── .prettierrc.json             # Prettier 配置
├── package.json                 # 项目依赖配置
└── README.md                    # 项目说明文档
```

---

## 📄 页面功能说明

| 路由路径 | 页面名称 | 功能说明 |
|---------|---------|---------|
| `/` | 首页 | 重定向至智能上传页 |
| `/login` | 登录页 | 用户登录认证 |
| `/register` | 注册页 | 新用户注册 |
| `/upload` | 智能上传 | 拖拽/点击上传票据，AI 自动识别票据信息 |
| `/list` | 归档列表 | 查看历史归档记录，支持编辑/删除操作 |
| `/stats` | 数据报表 | ECharts 可视化统计（支出趋势图、分类占比等） |
| `/chat` | AI 财务顾问 | 智能对话系统，提供财务建议 |
| `/budget` | 预算中心 | 预算设置与支出控制管理 |
| `/profile` | 个人中心 | 用户个人信息管理 |
| `/calendar` | 财务日历 | 财务事件时间线可视化 |
| `/settings` | 系统设置 | 应用程序配置管理 |
| `/graph` | 知识图谱 | 财务数据关联关系可视化 |
| `/recycle` | 回收站 | 已删除数据管理与恢复 |
| `/approval` | 审批中心 | 多级审批流程管理 |

---

## 🔧 配置说明

### API 基础路径

默认后端 API 地址为 `http://localhost:8080`。如需修改，建议使用环境变量进行配置。

#### 创建环境变量文件

在项目根目录创建 `.env.development` 文件（开发环境）：

```env
VITE_API_BASE_URL=http://localhost:8080
```

在项目根目录创建 `.env.production` 文件（生产环境）：

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

#### 在代码中使用环境变量

```typescript
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
```

### Axios 拦截器

在 `src/main.ts` 中已配置全局 Axios 拦截器：

#### 请求拦截器
- 自动在请求头中附加 `Authorization` Token
- Token 从 `localStorage` 中读取

#### 响应拦截器
- 401 状态码自动跳转登录页
- 自动清除失效的 Token

### 路由守卫

项目实现了基于 Token 的路由权限控制：

- **白名单页面**：`/login`、`/register` 无需 Token 即可访问
- **受保护页面**：其他页面需登录后才能访问，未登录自动跳转到 `/login`

---

## 💻 开发工具推荐

### VS Code 插件

- [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 官方语言支持插件
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TypeScript 支持
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 代码规范检查
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化工具
- [Vue VSCode Snippets](https://marketplace.visualstudio.com/items?itemName=sdras.vue-vscode-snippets) - Vue 代码片段

> **注意**：如已安装 Vetur 插件，请禁用以避免与 Volar 冲突。

### 浏览器开发者工具

- **Chrome/Edge**：[Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**：[Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

---

## 🔗 关联项目

### 后端仓库

本项目的后端服务由以下仓库提供：

🔗 **[SmartDoc Backend](https://github.com/IIICJXXIII/smart_doc_backend)**

---

## 📝 开发注意事项

1. **TypeScript 类型支持**：已在 `env.d.ts` 中声明 `.vue` 文件模块，确保 IDE 正确识别。
2. **Element Plus 导入**：当前为完整引入，如需优化打包体积可配置按需自动导入。
3. **状态持久化**：用户 Token 存储于 `localStorage`，刷新页面后自动恢复登录状态。
4. **路由懒加载**：除首屏核心页面外，其他页面采用动态导入优化首屏加载速度。
5. **代码规范**：提交代码前请运行 `npm run lint` 和 `npm run format` 确保代码风格一致。

---

## 📚 相关文档

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vite 配置文档](https://vitejs.dev/config/)
- [Element Plus 文档](https://element-plus.org/)
- [Vue Router 文档](https://router.vuejs.org/)
- [Pinia 文档](https://pinia.vuejs.org/)
- [Apache ECharts 文档](https://echarts.apache.org/)
- [Axios 文档](https://axios-http.com/)

---

## 🤝 贡献指南

欢迎提出 Issue 或 Pull Request 来改进本项目。

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

---

## 📄 开源许可证

本项目采用 **MIT License** 开源协议。详见 [LICENSE](LICENSE) 文件。

---

## 👨‍💻 作者

**IIICJXXIII**

- GitHub: [@IIICJXXIII](https://github.com/IIICJXXIII)

---

<div align="center">
  <p>如果这个项目对你有帮助，欢迎 ⭐️ Star 支持！</p>
  <p>© 2024 SmartDoc Frontend. All Rights Reserved.</p>
</div>
