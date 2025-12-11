<!--
  DocList.vue
  归档记录列表页面

  本组件是应用的核心功能之一，用于展示、搜索、管理用户的票据归档记录。
  主要功能包括：
  - 顶部搜索区域，支持按关键字和分类筛选。
  - 使用 Element Plus 的虚拟化表格 (el-table-v2) 高效展示大量数据。
  - 提供操作按钮，包括提交审核、查看详情、修改和删除。
  - 弹窗展示票据详情和提供编辑表单。
  - 基于用户角色（管理员/普通用户）控制操作权限。
-->
<template>
  <!-- 页面主容器，采用 flex 纵向布局 -->
  <div class="list-container">
    <!-- 顶部搜索区域 -->
    <div class="search-section">
      <el-card shadow="hover" :body-style="{ padding: '18px 20px 0 20px' }">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="商户名称">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索商户/项目..."
              prefix-icon="Search"
              clearable
              @input="onSearchInput" 
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

    <!-- 表格区域 -->
    <div class="table-section">
      <el-card
        shadow="never"
        class="table-card-wrapper"
        :body-style="{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }"
      >
        <!-- 表格工具栏，包含标题和新增按钮 -->
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

        <!-- 表格内容区域，使用 el-auto-resizer 自动计算宽高 -->
        <div class="table-content">
          <el-auto-resizer>
            <template #default="{ width, height }">
              <!-- Element Plus 虚拟化表格，用于高性能渲染大数据列表 -->
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

    <!-- 票据详情弹窗 -->
    <el-dialog v-model="dialogVisible" title="🧾 票据详情" width="450px" align-center>
      <div v-if="currentRow" class="detail-content">
        <!-- 驳回提示 -->
        <el-alert
          v-if="currentRow.status === 3"
          :title="'申请已被驳回：' + (currentRow.auditRemark || '无原因')"
          type="error"
          show-icon
          :closable="false"
          style="margin-bottom: 15px"
        />
        <!-- 风险预警提示 -->
        <el-alert
          v-if="currentRow.isAnomaly === 1"
          title="风险预警：金额异常"
          type="warning"
          description="该发票金额远超同类目平均水平。"
          show-icon
          :closable="false"
          style="margin-bottom: 15px"
        />

        <!-- 详情字段 -->
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
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 修改归档信息弹窗 -->
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
/**
 * @file DocList.vue - 归档记录列表页面的脚本
 * @description 负责数据获取、状态管理、用户交互和权限控制。
 */

// --- 依赖导入 ---
import { ref, reactive, onMounted, computed, h } from 'vue'
import { Search, Plus, Refresh, Warning, View, Edit, Delete, Top } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElTag, ElTooltip, ElButton } from 'element-plus'
import axios from 'axios'

// --- 状态定义 ---
const loading = ref(false) // 控制表格加载状态
const allTableData = ref<any[]>([]) // 存储从后端获取的所有原始数据
const displayData = ref<any[]>([]) // 存储经过筛选后在表格中实际显示的数据
const dialogVisible = ref(false) // 控制详情弹窗的显示
const currentRow = ref<any>(null) // 存储当前操作或查看的行数据

// --- 修改功能相关状态 ---
const editDialogVisible = ref(false) // 控制修改弹窗的显示
const editLoading = ref(false) // 控制修改表单提交的加载状态
const editForm = reactive({ // 修改表单的数据模型
  id: 0,
  merchantName: '',
  itemName: '',
  category: '',
  amount: 0,
  date: '',
  invoiceCode: '',
  userId: 0,
  createTime: '',
  status: 0, 
  auditRemark: '',
})

// --- 搜索功能相关状态 ---
const searchForm = reactive({ keyword: '', category: '' })
let searchTimer: any = null

// --- 计算属性 ---

// 计算当前显示数据的总条数
const total = computed(() => displayData.value.length)

/**
 * @computed isAdmin
 * @description 判断当前登录用户是否为管理员。
 *              通过读取 localStorage 中的用户信息并检查其 `role` 字段来实现。
 *              提供了一个安全的默认值 false。
 */
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
 * @function canEdit
 * @description 根据记录的状态和用户角色判断是否可以编辑或删除。
 * @param {number} status - 记录的审批状态。
 * @returns {boolean} - 如果可编辑则返回 true，否则返回 false。
 * - 管理员 (isAdmin) 总是可以编辑。
 * - 普通用户只能在记录为“草稿”(0) 或“已驳回”(3) 状态时进行编辑。
 */
const canEdit = (status: number) => {
  if (isAdmin.value) return true
  return status === 0 || status === 3
}

// --- 数据获取与生命周期 ---

/**
 * @function fetchList
 * @description 从后端获取所有归档记录列表。
 * @async
 */
const fetchList = async () => {
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/api/doc/list')
    allTableData.value = res.data // 存储完整数据
    handleSearch() // 获取数据后立即执行一次搜索，以应用默认筛选并更新视图
  } catch (error) {
    ElMessage.error('数据加载失败，请检查网络连接')
  } finally {
    loading.value = false
  }
}

// 组件挂载后立即获取数据
onMounted(() => {
  fetchList()
})

// --- 交互方法 ---

/**
 * @function handleSearch
 * @description 根据搜索表单的条件筛选数据并更新 `displayData`。
 */
const onSearchInput = () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 300) // 延迟300毫秒执行
}

const handleSearch = () => {
  displayData.value = allTableData.value.filter((item) => {
    const matchName = // 关键字匹配逻辑
      !searchForm.keyword ||
      (item.merchantName && item.merchantName.includes(searchForm.keyword)) ||
      (item.itemName && item.itemName.includes(searchForm.keyword))
    const matchCat = !searchForm.category || item.category === searchForm.category // 分类匹配逻辑
    return matchName && matchCat
  })
}

/**
 * @function resetSearch
 * @description 重置搜索条件并重新加载数据。
 */
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.category = ''
  handleSearch()
}

/**
 * @function viewDetail
 * @description 打开详情弹窗并设置当前行数据。
 * @param {any} row - 表格行数据。
 */
const viewDetail = (row: any) => {
  currentRow.value = row
  dialogVisible.value = true
}

/**
 * @function handleSubmit
 * @description 提交指定 ID 的记录进行审核。
 * @param {number} id - 记录的 ID。
 * @async
 */
const handleSubmit = async (id: number) => {
  try {
    const res = await axios.post(`http://localhost:8080/api/audit/submit/${id}`)
    if (res.data.code === 200) {
      ElMessage.success('已提交审核申请')
      fetchList() // 成功后刷新列表
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (e) {
    ElMessage.error('提交失败')
  }
}

/**
 * @function handleEdit
 * @description 打开修改弹窗并填充当前行的数据。
 * @param {any} row - 表格行数据。
 */
const handleEdit = (row: any) => {
  Object.assign(editForm, row) // 将行数据复制到编辑表单模型中
  editDialogVisible.value = true
}

/**
 * @function submitEdit
 * @description 提交修改后的表单数据。
 * @async
 */
const submitEdit = async () => {
  editLoading.value = true
  try {
    const res = await axios.post('http://localhost:8080/api/doc/save', editForm)
    if (res.data === 'success') {
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      fetchList() // 成功后刷新列表
    } else {
      ElMessage.error('修改失败：' + res.data)
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    editLoading.value = false
  }
}

/**
 * @function handleDelete
 * @description 删除指定行的数据，并带有确认提示框。
 * @param {any} row - 表格行数据。
 */
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除【${row.merchantName}】的记录吗？此操作不可恢复。`, '警告', {
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await axios.delete(`http://localhost:8080/api/doc/delete/${row.id}`)
      ElMessage.success('删除成功')
      fetchList() // 成功后刷新列表
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

/**
 * @function getCategoryType
 * @description 根据分类名称返回对应的 Element Plus 标签类型 (type)。
 * @param {string} cat - 分类名称。
 * @returns {string} - 'warning', 'success', 'info', 'primary', or ''
 */
const getCategoryType = (cat: string) => {
  if (cat?.includes('餐饮')) return 'warning'
  if (cat?.includes('交通')) return 'success'
  if (cat?.includes('办公')) return 'info'
  if (cat?.includes('通讯') || cat?.includes('电子')) return 'primary'
  return ''
}

// --- 虚拟化表格列定义 (使用 Vue 的 h 函数进行高级渲染) ---

const columns = computed(() => [
  {
    key: 'index',
    title: '#', // 列标题
    width: 60, // 列宽
    fixed: 'left', // 固定在左侧
    align: 'center', // 居中对齐
    // cellRenderer 用于自定义单元格的渲染方式
    cellRenderer: ({ rowIndex }: any) => rowIndex + 1, // 显示行号
  },
  {
    key: 'date',
    title: '开票日期',
    width: 120,
    align: 'center',
    cellRenderer: ({ rowData }: any) => rowData.date || '-', // 显示日期，如果为空则显示 '-'
  },
  {
    key: 'itemName',
    title: '项目名称',
    width: 180,
    // 使用 h 函数创建一个带 title 的 span，实现鼠标悬浮时显示完整内容
    cellRenderer: ({ rowData }: any) =>
      h(
        'span',
        { class: 'ellipsis-cell', title: rowData.itemName || '-' },
        rowData.itemName || '-'
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
        rowData.merchantName || '-'
      ),
  },
  {
    key: 'category',
    title: '分类',
    width: 120,
    align: 'center',
    // 使用 h 函数渲染一个 Element Plus 的 ElTag 组件
    cellRenderer: ({ rowData }: any) =>
      h(
        ElTag,
        { type: getCategoryType(rowData.category), size: 'small', effect: 'light' },
        () => rowData.category || '-'
      ),
  },
  {
    key: 'amount',
    title: '金额',
    width: 160,
    align: 'right',
    cellRenderer: ({ rowData }: any) => {
      const amountText = `￥${Number(rowData.amount || 0).toFixed(2)}`
      // 创建金额文本的 span 元素，如果金额异常则标红
      const amountSpan = h(
        'span',
        {
          class: 'amount-text',
          style: rowData.isAnomaly === 1 ? 'color:#F56C6C' : 'color:#303133',
        },
        amountText
      )

      // 如果是异常金额，则创建一个带 Tooltip 的警告图标
      const anomalyIcon =
        rowData.isAnomaly === 1
          ? h(
              ElTooltip,
              { content: '⚠️ 智能审计：该笔金额显著偏离您的历史消费习惯。', placement: 'top' },
              () => h(Warning, { style: 'color:#F56C6C', size: 16, class: 'shaking-icon' })
            )
          : null

      // 将金额文本和警告图标（如果存在）包裹在一个 div 中返回
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
        // 对于“已驳回”状态，使用 Tooltip 显示驳回原因
        return h(
          ElTooltip,
          { content: `驳回原因: ${rowData.auditRemark || '无'}`, placement: 'top' },
          () => h(ElTag, { type: 'danger', style: 'cursor: help' }, () => '已驳回')
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
        rowData.invoiceCode || '-'
      ),
  },
  {
    key: 'actions',
    title: '操作',
    width: 240,
    align: 'center',
    fixed: 'right', // 固定在右侧
    cellRenderer: ({ rowData }: any) => {
      const buttons = []

      // 仅在“草稿”或“已驳回”状态下显示“提交”按钮
      if (rowData.status === 0 || rowData.status === 3) {
        buttons.push(
          h(ElButton, { link: true, size: 'small', type: 'success', icon: Top, onClick: () => handleSubmit(rowData.id) }, () => '提交')
        )
      }

      // “详情”按钮始终显示
      buttons.push(
        h(ElButton, { link: true, size: 'small', type: 'primary', icon: View, onClick: () => viewDetail(rowData) }, () => '详情')
      )

      // “修改”按钮：根据 canEdit 函数的返回值决定是否禁用
      buttons.push(
        h(ElButton, { link: true, size: 'small', type: 'primary', icon: Edit, disabled: !canEdit(rowData.status), onClick: () => handleEdit(rowData) }, () => '修改')
      )

      // “删除”按钮：根据 canEdit 函数的返回值决定是否禁用
      buttons.push(
        h(ElButton, { link: true, size: 'small', type: 'danger', icon: Delete, disabled: !canEdit(rowData.status), onClick: () => handleDelete(rowData) }, () => '删除')
      )

      // 将所有按钮包裹在一个 div 中返回
      return h('div', { class: 'action-cell' }, buttons)
    },
  },
])
</script>

<!--
  Scoped CSS
  - `scoped` 属性确保样式仅应用于当前组件。
-->
<style scoped>
/* 页面主容器，使用 flex 布局实现垂直分布和间距 */
.list-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
/* 搜索区域卡片样式 */
.search-section .el-card {
  border-radius: 8px;
  border: none;
}
/* 表格区域容器，flex: 1 使其填充剩余空间 */
.table-section {
  flex: 1;
  min-height: 0; /* 防止 flex 子项在内容过多时溢出父容器 */
  display: flex;
  flex-direction: column;
}
/* 表格卡片包装器，确保其高度充满父容器 */
.table-card-wrapper {
  height: 100%;
  border-radius: 8px;
  border: none;
  display: flex;
  flex-direction: column;
}
/* 表格顶部的工具栏 */
.table-toolbar {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0; /* 防止工具栏被压缩 */
}
/* 工具栏标题样式 */
.title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
/* 表格内容区域，flex: 1 填充卡片剩余空间 */
.table-content {
  flex: 1;
  overflow: hidden; /* 隐藏 AutoResizer 之外的溢出 */
  padding: 0 16px;
}

/* 详情弹窗内的项目样式 */
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

/* 风险预警图标的晃动动画 */
.shaking-icon {
  animation: shake 2s infinite;
  cursor: help;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
  20%, 40%, 60%, 80% { transform: translateX(2px); }
}

/* 确保虚拟表格高度正确 */
.virtual-table {
  height: 100%;
}
/* 用于长文本单元格的省略号样式 */
.ellipsis-cell {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 金额单元格样式，实现右对齐和图标间距 */
.amount-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
/* 操作按钮单元格样式，实现居中和间距 */
.action-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>