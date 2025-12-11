<!--
  ApprovalCenter.vue
  审批工作台页面 (管理员专属)

  本组件为管理员提供了一个集中处理用户提交的报销申请的界面。
  - 以网格卡片的形式清晰地展示每一条待审批的记录。
  - 管理员可以快速进行“通过”或“驳回”操作。
  - 如果列表为空，则显示友好的提示信息。
-->
<template>
  <!-- 页面主容器 -->
  <div class="approval-container">
    <el-card shadow="never" class="main-card">
      <!-- 卡片头部，包含标题和刷新按钮 -->
      <template #header>
        <div class="header">
          <div class="left">
            <span>⚖️ 审批工作台 (Approval Workbench)</span>
            <!-- 动态显示待处理任务数量 -->
            <el-tag
              type="danger"
              effect="dark"
              round
              style="margin-left: 10px"
              v-if="list.length > 0"
            >
              {{ list.length }} 待处理
            </el-tag>
          </div>
          <el-button @click="fetchPending" icon="Refresh">刷新列表</el-button>
        </div>
      </template>

      <!-- 当没有待审批任务时，显示空状态提示 -->
      <el-empty v-if="list.length === 0" description="暂无待审核申请，去喝杯咖啡吧 ☕️" />

      <!-- 待审批任务的网格布局容器 -->
      <div v-else class="task-grid">
        <!-- 遍历待审批列表，为每个任务渲染一个卡片 -->
        <el-card v-for="item in list" :key="item.id" shadow="hover" class="task-card">
          <!-- 卡片顶部：申请人ID和日期 -->
          <div class="card-top">
            <div class="user-badge">申请人 ID: {{ item.userId }}</div>
            <div class="date">{{ item.date }}</div>
          </div>

          <!-- 卡片主体：金额、商户、项目等核心信息 -->
          <div class="card-body">
            <div class="amount">¥{{ item.amount.toFixed(2) }}</div>
            <div class="merchant">{{ item.merchantName }}</div>
            <div class="item-name">{{ item.itemName }}</div>
            <el-tag size="small" class="category-tag">{{ item.category }}</el-tag>

            <!-- 如果存在风险预警，则显示提示 -->
            <div v-if="item.isAnomaly === 1" class="anomaly-alert">
              <el-icon><Warning /></el-icon> 系统风控预警：金额异常
            </div>
          </div>

          <!-- 卡片底部：操作按钮 -->
          <div class="card-footer">
            <el-button type="success" plain @click="handlePass(item.id)">通过</el-button>
            <el-button type="danger" plain @click="openReject(item)">驳回</el-button>
          </div>
        </el-card>
      </div>
    </el-card>

    <!-- 驳回原因填写弹窗 -->
    <el-dialog v-model="rejectVisible" title="填写驳回原因" width="400px">
      <el-input
        v-model="rejectReason"
        type="textarea"
        placeholder="例如：发票模糊、不符合报销规定..."
        :rows="3"
      />
      <template #footer>
        <el-button @click="rejectVisible = false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * @file ApprovalCenter.vue - 审批工作台页面的脚本
 * @description 负责获取待审批列表、处理管理员的审批操作（通过/驳回），并与后端API交互。
 */

// --- 依赖导入 ---
import { ref, onMounted } from 'vue'
import { Refresh, Warning } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'

// --- 响应式状态定义 ---
const list = ref<any[]>([]) // 存储待审批任务列表
const rejectVisible = ref(false) // 控制驳回原因弹窗的显示状态
const rejectReason = ref('') // 存储驳回原因的输入值
const currentItem = ref<any>(null) // 存储当前正在操作的审批项

// --- 生命周期钩子 ---
// 组件挂载后，立即获取待审批列表
onMounted(() => fetchPending())

// --- 方法定义 ---

/**
 * @function fetchPending
 * @description 从后端获取所有待审批的申请列表。
 * @async
 * - 如果用户不是管理员 (后端返回403)，会显示警告信息。
 */
const fetchPending = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/audit/pending-list')
    if (res.data.code === 200) {
      list.value = res.data.data
    } else if (res.data.code === 403) {
      ElMessage.warning('权限不足，只有管理员才能访问审批工作台。')
      list.value = [] // 清空列表以显示空状态
    }
  } catch (e) {
    console.error('获取待审批列表失败:', e)
    ElMessage.error('无法连接到服务器。')
  }
}

/**
 * @function handlePass
 * @description 处理“通过”操作，向后端发送批准请求。
 * @param {number} id - 要批准的记录ID。
 * @async
 */
const handlePass = async (id: number) => {
  try {
    const res = await axios.post(`http://localhost:8080/api/audit/pass/${id}`)
    if (res.data.code === 200) {
      ElMessage.success('操作成功：已批准该申请。')
      fetchPending() // 操作成功后刷新列表
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e) {
    ElMessage.error('操作失败，请重试。')
  }
}

/**
 * @function openReject
 * @description 打开驳回原因填写弹窗，并记录当前操作项。
 * @param {any} item - 用户点击“驳回”的审批项数据。
 */
const openReject = (item: any) => {
  currentItem.value = item
  rejectReason.value = '' // 清空上次输入的原因
  rejectVisible.value = true
}

/**
 * @function confirmReject
 * @description 确认驳回操作，向后端发送带有原因的驳回请求。
 * @async
 */
const confirmReject = async () => {
  if (!rejectReason.value) {
    return ElMessage.warning('请填写驳回原因。')
  }
  try {
    const res = await axios.post(`http://localhost:8080/api/audit/reject/${currentItem.value.id}`, {
      reason: rejectReason.value,
    })
    if (res.data.code === 200) {
      ElMessage.success('操作成功：已驳回该申请。')
      rejectVisible.value = false
      fetchPending() // 操作成功后刷新列表
    } else {
      ElMessage.error(res.data.msg || '操作失败')
    }
  } catch (e) {
    ElMessage.error('操作失败，请重试。')
  }
}
</script>

<style scoped>
/* 页面主容器样式 */
.approval-container {
  padding: 24px;
  height: 100%;
  box-sizing: border-box; /* 确保 padding 不会撑大容器 */
}

/* 主卡片样式，使其充满容器高度 */
.main-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 深度选择器，修改 el-card__body 样式，使其可滚动 */
:deep(.el-card__body) {
  flex: 1; /* 占据剩余空间 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
  background: #f5f7fa; /* 设置一个浅灰色背景 */
  padding: 20px;
}

/* 头部样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header .left {
  display: flex;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

/* 任务卡片网格布局 */
.task-grid {
  display: grid;
  /* 响应式列数：自动填充，每列最小280px */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.task-card {
  border: none;
  border-radius: 8px;
  transition: transform 0.2s; /* 添加悬浮动效 */
}
.task-card:hover {
  transform: translateY(-3px);
}

/* 卡片内部布局 */
.card-top {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}
.user-badge {
  background: #e9e9eb;
  padding: 2px 6px;
  border-radius: 4px;
}

.card-body {
  text-align: center;
  margin-bottom: 15px;
}
.amount {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}
.merchant {
  font-weight: 500;
  font-size: 15px;
}
.item-name {
  color: #606266;
  font-size: 13px;
  margin-bottom: 8px;
}
.category-tag {
  margin-bottom: 8px;
}

/* 风险预警提示条 */
.anomaly-alert {
  background: #fef0f0;
  color: #f56c6c;
  font-size: 12px;
  padding: 5px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

/* 卡片底部按钮容器 */
.card-footer {
  display: flex;
  gap: 10px;
}
.card-footer .el-button {
  flex: 1; /* 让按钮平分宽度 */
}
</style>