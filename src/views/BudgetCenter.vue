<template>
  <div class="budget-container">
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <div class="left">
          <h2>💰 预算控制中心</h2>
          <p>设置每月消费限额，实时监控支出进度</p>
        </div>
        <el-button type="primary" size="large" :icon="Plus" @click="dialogVisible = true">
          新增预算设定
        </el-button>
      </div>
    </el-card>

    <div class="card-grid">
      <el-card v-for="item in budgetList" :key="item.id" class="budget-item" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="category-title">{{ item.category }}</span>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(item.id)"></el-button>
          </div>
        </template>

        <div class="budget-body">
          <div class="amount-info">
            <div class="used">
              <span class="label">已用</span>
              <span class="num">¥{{ item.usedAmount.toFixed(2) }}</span>
            </div>
            <div class="limit">
              <span class="label">限额</span>
              <span class="num">¥{{ item.limitAmount.toFixed(2) }}</span>
            </div>
          </div>

          <el-progress
            :text-inside="true"
            :stroke-width="24"
            :percentage="calculatePercent(item)"
            :status="getStatus(item)"
          />

          <div class="status-text" :style="{ color: getStatusColor(item) }">
            {{ getStatusText(item) }}
          </div>
        </div>
      </el-card>

      <el-empty v-if="budgetList.length === 0" description="暂无预算，快去设置一个吧！" />
    </div>

    <el-dialog v-model="dialogVisible" title="设置分类预算" width="400px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="消费分类">
          <el-select v-model="form.category" placeholder="请选择分类" style="width: 100%">
            <el-option label="餐饮美食" value="餐饮美食" />
            <el-option label="交通出行" value="交通出行" />
            <el-option label="办公耗材" value="办公耗材" />
            <el-option label="通讯网络" value="通讯网络" />
            <el-option label="电子设备" value="电子设备" />
          </el-select>
        </el-form-item>
        <el-form-item label="预算金额">
          <el-input-number v-model="form.limitAmount" :min="100" :step="100" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBudget">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const budgetList = ref<any[]>([])
const dialogVisible = ref(false)
const form = reactive({ category: '', limitAmount: 1000 })

onMounted(() => fetchList())

const fetchList = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/budget/list')
    if (res.data.code === 200) {
      budgetList.value = res.data.data
    }
  } catch (e) {
    ElMessage.error('获取预算失败')
  }
}

const saveBudget = async () => {
  if (!form.category) return ElMessage.warning('请选择分类')
  try {
    const res = await axios.post('http://localhost:8080/api/budget/save', form)
    if (res.data.code === 200) {
      ElMessage.success('设置成功')
      dialogVisible.value = false
      fetchList()
    }
  } catch (e) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定删除该预算设定吗？', '提示', { type: 'warning' }).then(async () => {
    await axios.delete(`http://localhost:8080/api/budget/delete/${id}`)
    ElMessage.success('删除成功')
    fetchList()
  })
}

// 辅助计算函数
const calculatePercent = (item: any) => {
  const p = (item.usedAmount / item.limitAmount) * 100
  return p > 100 ? 100 : Number(p.toFixed(1))
}

const getStatus = (item: any) => {
  const p = item.usedAmount / item.limitAmount
  if (p >= 1) return 'exception' // 红色 (超支)
  if (p >= 0.8) return 'warning' // 黄色 (预警)
  return 'success' // 绿色 (正常)
}

const getStatusColor = (item: any) => {
  const status = getStatus(item)
  if (status === 'exception') return '#f56c6c'
  if (status === 'warning') return '#e6a23c'
  return '#67c23a'
}

const getStatusText = (item: any) => {
  const p = item.usedAmount / item.limitAmount
  if (p >= 1) return `⚠️ 已超支 ¥${(item.usedAmount - item.limitAmount).toFixed(2)}`
  if (p >= 0.8) return '⚠️ 预算即将耗尽'
  return '✅ 预算充足'
}
</script>

<style scoped>
.budget-container {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
  overflow-y: auto;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-content h2 {
  margin: 0 0 8px 0;
  color: #303133;
}
.header-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
}

.budget-body {
  padding: 10px 0;
}
.amount-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.used,
.limit {
  display: flex;
  flex-direction: column;
}
.label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}
.num {
  font-size: 18px;
  font-weight: bold;
  font-family: monospace;
}
.used .num {
  color: #303133;
}
.limit .num {
  color: #909399;
}

.status-text {
  margin-top: 12px;
  font-size: 14px;
  font-weight: bold;
  text-align: right;
}
</style>
