<template>
  <div class="list-container">
    <div class="search-section">
      <el-card shadow="hover" :body-style="{ padding: '18px 20px 0 20px' }">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商户名称">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索商户/项目..."
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category"
              placeholder="全部类型"
              clearable
              @change="handleSearch"
              style="width: 140px"
            >
              <el-option label="餐饮美食" value="餐饮美食" />
              <el-option label="交通出行" value="交通出行" />
              <el-option label="办公耗材" value="办公耗材" />
              <el-option label="通讯网络" value="通讯网络" />
              <el-option label="电子设备" value="电子设备" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" icon="Search">查询</el-button>
            <el-button @click="resetSearch" icon="Refresh">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="table-section">
      <el-card
        shadow="never"
        class="table-card-wrapper"
        :body-style="{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }"
      >
        <div class="table-toolbar">
          <div class="left-panel">
            <span class="title">🧾 归档记录</span>
            <el-tag type="info" size="small" effect="plain" style="margin-left: 8px">
              共 {{ total }} 条
            </el-tag>
          </div>
          <el-button type="primary" size="small" @click="$router.push('/upload')" icon="Plus">
            新增归档
          </el-button>
        </div>

        <div class="table-content">
          <el-auto-resizer>
            <template #default="{ width, height }">
              <el-table-v2
                class="virtual-table"
                :data="displayData"
                :columns="columns"
                :row-height="54"
                :header-height="44"
                :width="width"
                :height="height"
                row-key="id"
                v-loading="loading"
              />
            </template>
          </el-auto-resizer>
        </div>
      </el-card>
    </div>

    <el-dialog v-model="dialogVisible" title="🧾 票据详情" width="80vw" top="5vh" align-center class="preview-dialog">
      <div v-if="currentRow" class="detail-dialog-content">
        <!-- Left: Preview -->
        <div class="preview-pane">
          <vue-pdf-embed v-if="isPdf" :source="fileUrl" class="pdf-viewer" />
          <div v-else-if="fileUrl" v-viewer class="image-viewer">
             <img :src="fileUrl" alt="发票图片" />
          </div>
          <div v-else class="no-file-tip">无可用预览文件</div>
        </div>

        <!-- Right: Details -->
        <div class="detail-pane">
          <el-alert
            v-if="currentRow.status === 3"
            :title="'申请已被驳回：' + (currentRow.auditRemark || '无原因')"
            type="error"
            show-icon
            :closable="false"
            style="margin-bottom: 15px"
          />
          <el-alert
            v-if="currentRow.isAnomaly === 1"
            title="风险预警：金额异常"
            type="warning"
            description="该发票金额远超同类目平均水平。"
            show-icon
            :closable="false"
            style="margin-bottom: 15px"
          />

          <div class="detail-item">
            <label>审批状态：</label>
            <el-tag v-if="currentRow.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="currentRow.status === 1" type="warning">审核中</el-tag>
            <el-tag v-else-if="currentRow.status === 2" type="success">已通过</el-tag>
            <el-tag v-else-if="currentRow.status === 3" type="danger">已驳回</el-tag>
          </div>
          <div class="detail-item">
            <label>商户名称：</label><span>{{ currentRow.merchantName }}</span>
          </div>
          <div class="detail-item">
            <label>项目名称：</label><span>{{ currentRow.itemName || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>发票号码：</label><span>{{ currentRow.invoiceCode || '-' }}</span>
          </div>
          <div class="detail-item">
            <label>开票日期：</label><span>{{ currentRow.date }}</span>
          </div>
          <div class="detail-item">
            <label>归档金额：</label
            ><span style="font-weight: bold">￥{{ Number(currentRow.amount).toFixed(2) }}</span>
          </div>
          <div class="detail-item">
            <label>智能分类：</label><el-tag>{{ currentRow.category }}</el-tag>
          </div>
          <div class="detail-item">
            <label>创建时间：</label
            ><span style="color: #999">{{ currentRow.createTime?.replace('T', ' ') }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editDialogVisible" title="✏️ 修改归档信息" width="500px" align-center>
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="商户名称">
          <el-input v-model="editForm.merchantName" />
        </el-form-item>
        <el-form-item label="项目名称">
          <el-input v-model="editForm.itemName" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="editForm.category" style="width: 100%">
            <el-option label="餐饮美食" value="餐饮美食" />
            <el-option label="交通出行" value="交通出行" />
            <el-option label="办公耗材" value="办公耗材" />
            <el-option label="通讯网络" value="通讯网络" />
            <el-option label="电子设备" value="电子设备" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="金额">
              <el-input-number
                v-model="editForm.amount"
                :precision="2"
                :step="0.1"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="日期">
              <el-date-picker
                v-model="editForm.date"
                type="date"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="发票号码">
          <el-input v-model="editForm.invoiceCode" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="editLoading">保存修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue'
import { Search, Plus, Refresh, Warning, View, Edit, Delete, Top } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElTag, ElTooltip, ElButton } from 'element-plus'
import axios from 'axios'
import VuePdfEmbed from 'vue-pdf-embed'
import 'viewerjs/dist/viewer.css'
import { directive as viewer } from 'v-viewer'

// --- 状态定义 ---
const loading = ref(false)
const allTableData = ref<any[]>([])
const displayData = ref<any[]>([])
const dialogVisible = ref(false)
const currentRow = ref<any>(null)

// 修改相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editForm = reactive({
  id: 0,
  merchantName: '',
  itemName: '',
  category: '',
  amount: 0,
  date: '',
  invoiceCode: '',
  userId: 0,
  createTime: '',
  status: 0, // 保留原状态
  auditRemark: '',
})

const searchForm = reactive({ keyword: '', category: '' })

// --- 计算属性 ---
const total = computed(() => displayData.value.length)

const fileUrl = computed(() => {
  if (currentRow.value?.rawImageUrl) {
    return `http://localhost:8080${currentRow.value.rawImageUrl}`
  }
  return ''
})

const isPdf = computed(() => {
  return fileUrl.value.toLowerCase().endsWith('.pdf')
})

/** 当前用户是否为管理员 */
const isAdmin = computed(() => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user.role === 'admin'
    }
  } catch (e) {
    console.warn('解析用户信息失败', e)
  }
  return false
})

/**
 * 判断是否可以编辑记录
 * - admin 用户: 始终可以编辑
 * - 普通用户: 只有状态为“草稿(0)”或“已驳回(3)”时可编辑
 */
const canEdit = (status: number) => {
  if (isAdmin.value) return true
  return status === 0 || status === 3
}

// --- 方法 ---

const fetchList = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/api/doc/list')
    allTableData.value = res.data
    handleSearch()
  } catch (error) {
    ElMessage.error('无法连接到数据库')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchList()
})

// 搜索
const handleSearch = () => {
  displayData.value = allTableData.value.filter((item) => {
    const matchName =
      !searchForm.keyword ||
      (item.merchantName && item.merchantName.includes(searchForm.keyword)) ||
      (item.itemName && item.itemName.includes(searchForm.keyword))
    const matchCat = !searchForm.category || item.category === searchForm.category
    return matchName && matchCat
  })
}

const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  handleSearch()
}

// 详情
const viewDetail = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

// 🔥 核心：提交审核
const handleSubmit = async (id: number) => {
  try {
    const res = await axios.post(`http://localhost:8080/api/audit/submit/${id}`)
    if (res.data.code === 200) {
      ElMessage.success('已提交申请')
      fetchList()
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

// 修改按钮
const handleEdit = (row: any) => {
  Object.assign(editForm, row)
  editDialogVisible.value = true
}

const submitEdit = async () => {
  editLoading.value = true
  try {
    const res = await axios.post('http://localhost:8080/api/doc/save', editForm)
    if (res.data === 'success') {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      fetchList()
    } else {
      ElMessage.error('修改失败：' + res.data)
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    editLoading.value = false
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除【${row.merchantName}】的记录吗？`, '警告', {
    confirmButtonText: '删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await axios.delete(`http://localhost:8080/api/doc/delete/${row.id}`)
      ElMessage.success('删除成功')
      fetchList()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const getCategoryType = (cat: string) => {
  if (cat?.includes('餐饮')) return 'warning'
  if (cat?.includes('交通')) return 'success'
  if (cat?.includes('办公')) return 'info'
  if (cat?.includes('通讯') || cat?.includes('电子')) return 'primary'
  return ''
}

// 虚拟表格列定义（Element Plus TableV2）
const columns = computed(() => [
  {
    key: 'index',
    title: '#',
    width: 60,
    fixed: 'left',
    align: 'center',
    cellRenderer: ({ rowIndex }: any) => rowIndex + 1,
  },
  {
    key: 'date',
    title: '开票日期',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData }: any) => rowData.date || '-',
  },
  {
    key: 'itemName',
    title: '项目名称',
    width: 180,
    cellRenderer: ({ rowData }: any) =>
      h(
        'span',
        { class: 'ellipsis-cell', title: rowData.itemName || '-' },
        rowData.itemName || '-',
      ),
  },
  {
    key: 'merchantName',
    title: '商户名称',
    width: 200,
    cellRenderer: ({ rowData }: any) =>
      h(
        'span',
        { class: 'ellipsis-cell', title: rowData.merchantName || '-' },
        rowData.merchantName || '-',
      ),
  },
  {
    key: 'category',
    title: '分类',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData }: any) =>
      h(
        ElTag,
        { type: getCategoryType(rowData.category), size: 'small', effect: 'light' },
        () => rowData.category || '-',
      ),
  },
  {
    key: 'amount',
    title: '金额',
    width: 160,
    align: 'right',
    cellRenderer: ({ rowData }: any) => {
      const amountText = `￥${Number(rowData.amount || 0).toFixed(2)}`
      const amountSpan = h(
        'span',
        {
          class: 'amount-text',
          style: rowData.isAnomaly === 1 ? 'color:#F56C6C' : 'color:#303133',
        },
        amountText,
      )

      const anomalyIcon =
        rowData.isAnomaly === 1
          ? h(
              ElTooltip,
              {
                content: '⚠️ 智能审计：该笔金额显著偏离您的历史消费习惯。',
                placement: 'top',
              },
              () => h(Warning, { style: 'color:#F56C6C', size: 16, class: 'shaking-icon' }),
            )
          : null

      return h('div', { class: 'amount-cell' }, [amountSpan, anomalyIcon].filter(Boolean))
    },
  },
  {
    key: 'status',
    title: '审批状态',
    width: 140,
    align: 'center',
    cellRenderer: ({ rowData }: any) => {
      const status = rowData.status
      if (status === 0) return h(ElTag, { type: 'info' }, () => '草稿')
      if (status === 1) return h(ElTag, { type: 'warning' }, () => '审核中')
      if (status === 2) return h(ElTag, { type: 'success' }, () => '已通过')
      if (status === 3) {
        return h(
          ElTooltip,
          { content: `驳回原因: ${rowData.auditRemark || '无'}`, placement: 'top' },
          () => h(ElTag, { type: 'danger', style: 'cursor: help' }, () => '已驳回'),
        )
      }
      return h(ElTag, { type: 'info' }, () => '-')
    },
  },
  {
    key: 'invoiceCode',
    title: '发票号码',
    width: 160,
    align: 'center',
    cellRenderer: ({ rowData }: any) =>
      h(
        'span',
        { class: 'ellipsis-cell', title: rowData.invoiceCode || '-' },
        rowData.invoiceCode || '-',
      ),
  },
  {
    key: 'actions',
    title: '操作',
    width: 240,
    align: 'center',
    fixed: 'right',
    cellRenderer: ({ rowData }: any) => {
      const buttons = []

      if (rowData.status === 0 || rowData.status === 3) {
        buttons.push(
          h(
            ElButton,
            { link: true, size: 'small', type: 'success', icon: Top, onClick: () => handleSubmit(rowData.id) },
            () => '提交',
          ),
        )
      }

      buttons.push(
        h(
          ElButton,
          { link: true, size: 'small', type: 'primary', icon: View, onClick: () => viewDetail(rowData) },
          () => '详情',
        ),
      )

      // 修改按钮: admin 始终可用，普通用户仅草稿/已驳回时可用
      buttons.push(
        h(
          ElButton,
          { link: true, size: 'small', type: 'primary', icon: Edit, disabled: !canEdit(rowData.status), onClick: () => handleEdit(rowData) },
          () => '修改',
        ),
      )

      // 删除按钮: admin 始终可用，普通用户仅草稿/已驳回时可用
      buttons.push(
        h(
          ElButton,
          { link: true, size: 'small', type: 'danger', icon: Delete, disabled: !canEdit(rowData.status), onClick: () => handleDelete(rowData) },
          () => '删除',
        ),
      )

      return h('div', { class: 'action-cell' }, buttons)
    },
  },
])

const vViewer = viewer
</script>

<style scoped>
.list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-section .el-card {
  border-radius: 8px;
  border: none;
}
.table-section {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.table-card-wrapper {
  height: 100%;
  border-radius: 8px;
  border: none;
  display: flex;
  flex-direction: column;
}
.table-toolbar {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
.table-content {
  flex: 1;
  overflow: hidden;
  padding: 0 16px;
}

/* --- 弹窗样式 --- */
.detail-dialog-content {
  display: flex;
  height: 75vh; /* 让弹窗内容撑满高度 */
  gap: 20px;
}
.preview-pane {
  flex: 3; /* 预览区域占 3/5 */
  background-color: #f5f7fa;
  border-radius: 8px;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-pane {
  flex: 2; /* 详情区域占 2/5 */
  overflow-y: auto;
  padding-right: 10px;
}

.pdf-viewer {
  width: 100%;
}

.image-viewer img {
  max-width: 100%;
  cursor: zoom-in;
}

.no-file-tip {
  color: #909399;
  font-size: 16px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  align-items: baseline;
  border-bottom: 1px dashed #f2f2f2;
  padding-bottom: 8px;
}
.detail-item label {
  width: 90px;
  text-align: right;
  color: #909399;
  font-weight: 500;
  margin-right: 12px;
}
.detail-item span {
  color: #303133;
  font-size: 15px;
  flex: 1;
}

.shaking-icon {
  animation: shake 2s infinite;
  cursor: help;
}
@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-2px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(2px);
  }
}

.virtual-table {
  height: 100%;
}
.ellipsis-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.amount-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
