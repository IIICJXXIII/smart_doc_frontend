<!--
  SmartUploader.vue
  智能上传与识别页面

  本组件是系统的核心入口，提供一个集文件上传、预览、AI自动识别和人工校对为一体的工作区。
  - 左侧为文件预览区：支持拖拽或点击上传图片/PDF，并提供文件预览。
  - 右侧为表单区：显示AI从文件中提取的关键信息（如商户、金额、日期等），并允许用户进行修改和确认。
-->
<template>
  <!-- 页面根容器 -->
  <div class="smart-container">
    <!-- 主要工作区，采用左右分栏布局 -->
    <div class="workspace">
      <!-- 左侧：文件预览面板 -->
      <div class="preview-panel">
        <div class="preview-card">
          <!-- 面板头部：标题和文件类型标签 -->
          <div class="panel-header">
            <div class="title-group">
              <el-icon :size="18"><Document /></el-icon>
              <span class="title-text">票据原件预览</span>
            </div>
            <el-tag v-if="fileType" size="small" effect="plain">
              {{ fileType === 'pdf' ? 'PDF 文档' : '图片文件' }}
            </el-tag>
          </div>

          <!-- 上传组件容器 -->
          <div class="upload-box">
            <el-upload
              class="upload-demo"
              drag
              action="#" 
              :http-request="customUpload" 
              :show-file-list="false" 
              :before-upload="beforeUpload" 
            >
              <!-- 文件已上传后的预览区域 -->
              <div v-if="fileUrl" class="preview-content">
                <!-- 图片预览 -->
                <img
                  v-if="fileType === 'image'"
                  :src="fileUrl"
                  class="uploaded-img"
                  alt="preview"
                />
                <!-- PDF 预览 -->
                <embed
                  v-else-if="fileType === 'pdf'"
                  :src="fileUrl"
                  type="application/pdf"
                  class="uploaded-pdf"
                />
                <!-- 鼠标悬浮时显示的重新上传遮罩 -->
                <div class="reupload-mask">
                  <el-icon><Refresh /></el-icon>
                  <span>点击更换文件</span>
                </div>
              </div>

              <!-- 未上传文件时的占位提示 -->
              <div v-else class="upload-placeholder">
                <div class="icon-bg">
                  <el-icon :size="32"><UploadFilled /></el-icon>
                </div>
                <div class="upload-text">拖拽 PDF / 图片 到此处 <br />或 <em>点击上传</em></div>
                <p class="sub-text">支持 JPG, PNG, PDF (Max 10MB)</p>
              </div>
            </el-upload>
          </div>
        </div>
      </div>

      <!-- 右侧：AI 识别结果与表单面板 -->
      <div class="form-panel">
        <el-card class="box-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span class="header-title">AI 识别结果</span>
                <p class="card-subtitle">请人工校对后归档</p>
              </div>
              <!-- 根据加载状态显示不同的标签 -->
              <div class="header-right">
                <el-tag type="warning" effect="dark" round v-if="loading">
                  <el-icon class="is-loading"><Loading /></el-icon> 分析中...
                </el-tag>
                <el-tag type="success" effect="dark" round v-else-if="fileUrl">
                  <el-icon><CircleCheck /></el-icon> 识别完成
                </el-tag>
              </div>
            </div>
          </template>

          <!-- 表单滚动区域 -->
          <div class="form-scroll-area">
            <el-alert
              v-if="!loading && fileUrl"
              class="form-alert"
              title="AI 已自动提取关键信息，请核对。"
              type="success"
              :closable="false"
              show-icon
            />

            <!-- 校对表单 -->
            <el-form :model="formData" label-width="100px" label-position="top" size="large">
              <el-form-item label="商户名称 (Merchant)">
                <el-input
                  v-model="formData.merchantName"
                  prefix-icon="Shop"
                  placeholder="例如：农夫山泉 / 京东商城"
                />
              </el-form-item>

              <el-form-item label="项目名称 (Item Name)">
                <el-input
                  v-model="formData.itemName"
                  prefix-icon="Goods"
                  placeholder="例如：*饮料*农夫山泉天然水"
                />
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="开票日期">
                    <el-date-picker
                      v-model="formData.date"
                      type="date"
                      value-format="YYYY-MM-DD"
                      placeholder="选择日期"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="金额 (Amount)">
                    <el-input-number
                      v-model="formData.amount"
                      :precision="2"
                      :step="0.1"
                      :min="0"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="发票号码 (No.)">
                    <el-input
                      v-model="formData.invoiceCode"
                      prefix-icon="Ticket"
                      placeholder="20位数字"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="智能分类">
                    <el-select v-model="formData.category" placeholder="请选择" style="width: 100%">
                      <el-option label="餐饮美食" value="餐饮美食" />
                      <el-option label="交通出行" value="交通出行" />
                      <el-option label="办公耗材" value="办公耗材" />
                      <el-option label="通讯网络" value="通讯网络" />
                      <el-option label="电子设备" value="电子设备" />
                      <el-option label="其他" value="其他" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>

          <!-- 表单底部操作按钮 -->
          <div class="form-footer">
            <el-button @click="resetForm" icon="RefreshLeft" :disabled="loading">重置</el-button>
            <el-button type="primary" @click="saveDoc" :loading="loading" icon="FolderChecked">
              确认并归档
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * @file SmartUploader.vue - 智能上传页面的脚本
 * @description 负责文件上传、调用AI识别服务、展示结果、用户校对和最终保存的全部逻辑。
 */

// --- 依赖导入 ---
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  UploadFilled, Document, Refresh, Shop, Ticket, Goods, Loading, CircleCheck, FolderChecked, RefreshLeft,
} from '@element-plus/icons-vue'
import axios from 'axios'

// --- 类型定义 ---
// 定义表单数据的类型，增强代码可读性和健壮性
type FormState = {
  merchantName: string
  itemName: string
  date: string
  amount: number
  invoiceCode: string
  category: string
}

// --- 响应式状态定义 ---
const fileUrl = ref('') // 存储上传文件的本地预览URL (Blob URL)
const fileType = ref<'image' | 'pdf' | ''>('') // 标记上传文件的类型，用于条件渲染预览组件
const loading = ref(false) // 全局加载状态，控制AI识别和保存过程中的UI反馈

// 使用 reactive 创建表单数据模型
const formData = reactive<FormState>({
  merchantName: '',
  itemName: '',
  date: '',
  amount: 0,
  invoiceCode: '',
  category: '',
})

// --- 方法定义 ---

/**
 * @function beforeUpload
 * @description 在文件上传到服务器前执行的钩子函数，用于验证文件类型。
 * @param {File} rawFile - 用户选择的原始文件对象。
 * @returns {boolean} - 返回 `false` 将阻止上传。
 */
const beforeUpload = (rawFile: File): boolean => {
  const isPDF = rawFile.type === 'application/pdf'
  const isImage = rawFile.type.startsWith('image/')

  if (!isPDF && !isImage) {
    ElMessage.error('文件格式不支持！请上传 PDF 或图片文件。')
    return false
  }
  return true
}

/**
 * @function customUpload
 * @description 覆盖 Element Plus 的默认上传行为，实现自定义的上传和AI识别流程。
 * @async
 * @param {any} options - Element Plus 注入的对象，包含 `file` 属性。
 * 
 * @steps
 * 1. **创建本地预览**: 使用 `URL.createObjectURL` 为选定文件生成一个临时的本地URL，用于即时预览。
 * 2. **设置文件类型**: 判断文件MIME类型，为后续渲染 `<img>` 或 `<embed>` 做准备。
 * 3. **发起AI识别请求**:
 *    a. 设置加载状态为 `true`。
 *    b. 创建 `FormData` 对象，并将文件附加进去。
 *    c. 使用 `axios` 将文件 `POST` 到后端的OCR识别接口 (`/api/doc/upload`)。
 * 4. **处理识别结果**: 请求成功后，将后端返回的JSON数据填充到 `formData` 中。
 * 5. **异常处理**: 捕获请求失败的情况，并给出用户提示。
 * 6. **结束加载**: 在 `finally` 块中确保加载状态被重置为 `false`。
 */
const customUpload = async (options: any) => {
  const file = options.file

  // 1. 创建本地预览 URL
  fileUrl.value = URL.createObjectURL(file)

  // 2. 设置文件类型
  fileType.value = file.type === 'application/pdf' ? 'pdf' : 'image'

  loading.value = true

  // 3. 构建 FormData 并上传
  const data = new FormData()
  data.append('file', file)

  try {
    const res = await axios.post('http://localhost:8080/api/doc/upload', data)
    const aiResult = res.data

    // 4. 将AI识别结果填充到表单
    formData.merchantName = aiResult.merchantName || ''
    formData.itemName = aiResult.itemName || ''
    formData.date = aiResult.date || ''
    formData.amount = aiResult.amount ? Number(aiResult.amount) : 0
    formData.invoiceCode = aiResult.invoiceCode || ''
    formData.category = aiResult.category || ''

    ElMessage.success('AI识别完成，请核对右侧信息。')
  } catch (error) {
    console.error('AI识别请求失败:', error)
    ElMessage.error('识别服务连接失败，请检查后端是否启动。')
  } finally {
    // 6. 结束加载
    loading.value = false
  }
}

/**
 * @function resetForm
 * @description 重置整个页面状态，清空预览和表单数据，以便进行下一次上传。
 */
const resetForm = () => {
  fileUrl.value = ''
  fileType.value = ''
  // 循环清空 formData 的每个字段
  Object.keys(formData).forEach(key => {
    const field = key as keyof FormState;
    if (typeof formData[field] === 'number') {
      (formData[field] as any) = 0;
    } else {
      (formData[field] as any) = '';
    }
  });
}

/**
 * @function saveDoc
 * @description 将用户校对后的表单数据保存到数据库。
 * @async
 */
const saveDoc = async () => {
  // 基础表单验证
  if (!formData.merchantName || formData.amount <= 0) {
    ElMessage.warning('归档失败，请确保“商户名称”和“金额”已正确填写。')
    return
  }

  loading.value = true
  try {
    // 调用后端保存接口
    await axios.post('http://localhost:8080/api/doc/save', formData)
    ElMessage.success('归档成功！已存入数据库。')
    // 成功后重置页面，方便用户连续操作
    resetForm()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败，请检查网络或联系管理员。')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 1. 全局容器与布局 */
.smart-container {
  height: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.workspace {
  flex: 1; /* 占据所有可用垂直空间 */
  display: flex;
  gap: 20px;
  min-height: 0; /* flex布局关键，防止子元素溢出 */
  padding-bottom: 20px;
}

/* 2. 左右面板基础样式 */
.preview-panel {
  flex: 4; /* 预览区占比 */
  min-width: 400px;
  display: flex;
}
.form-panel {
  flex: 3; /* 表单区占比 */
  min-width: 350px;
  display: flex;
}

/* 3. 卡片通用样式 */
.preview-card, .box-card {
  background: #fff;
  border-radius: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  border: 1px solid #e4e7ed;
}

/* 4. 面板头部样式 */
.panel-header, .card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fcfcfc;
}
.title-group, .header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.title-text, .header-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}
.card-subtitle {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

/* 5. 上传区域样式 */
.upload-box {
  flex: 1;
  padding: 20px;
  background: #f5f7fa;
  overflow: hidden;
}

/* 深度选择器，修改Element Plus组件内部样式 */
:deep(.el-upload), :deep(.el-upload-dragger) {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  border: 1px dashed #dcdfe6;
}
:deep(.el-upload-dragger) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #fff;
  transition: all 0.3s;
}
:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background: #f0f9eb;
}

/* 6. 预览内容样式 */
.preview-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #52565e;
}
.uploaded-img, .uploaded-pdf {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain; /* 保证图片/PDF完整显示 */
}
.reupload-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
}
.preview-content:hover .reupload-mask { opacity: 1; }

/* 7. 上传占位符样式 */
.upload-placeholder .icon-bg {
  width: 64px;
  height: 64px;
  background: #ecf5ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #409eff;
}

/* 8. 表单区域特定样式 */
:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.form-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}
.form-alert { margin-bottom: 20px; }

.form-footer {
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  background: #fcfcfc;
  display: flex;
  gap: 12px;
}
.form-footer .el-button { flex: 1; height: 40px; }

/* 9. 响应式布局 */
@media (max-width: 900px) {
  .workspace { flex-direction: column; }
  .preview-panel { flex: none; height: 500px; }
}
</style>