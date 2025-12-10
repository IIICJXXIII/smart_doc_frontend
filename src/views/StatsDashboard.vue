<template>
  <div class="dashboard-container">
    <div class="stats-cards">
      <el-card shadow="hover" class="card-item">
        <div class="card-content">
          <div class="meta">
            <span class="label">累计归档金额</span>
            <el-tag type="success" size="small">+12% 同比</el-tag>
          </div>
          <div class="value">¥{{ totalAmount.toFixed(2) }}</div>
          <div class="footer">共计 {{ totalCount }} 张票据</div>
        </div>
        <div class="icon-bg success">
          <el-icon><Money /></el-icon>
        </div>
      </el-card>

      <el-card shadow="hover" class="card-item">
        <div class="card-content">
          <div class="meta">
            <span class="label">本月支出</span>
            <el-tag type="warning" size="small">预算内</el-tag>
          </div>
          <div class="value">¥{{ currentMonthAmount.toFixed(2) }}</div>
          <div class="footer">最近更新: {{ lastUpdate }}</div>
        </div>
        <div class="icon-bg warning">
          <el-icon><Wallet /></el-icon>
        </div>
      </el-card>

      <el-card shadow="hover" class="card-item">
        <div class="card-content">
          <div class="meta">
            <span class="label">最高频分类</span>
          </div>
          <div class="value">{{ topCategory }}</div>
          <div class="footer">占比 {{ topCategoryPercent }}%</div>
        </div>
        <div class="icon-bg primary">
          <el-icon><PieChart /></el-icon>
        </div>
      </el-card>
    </div>

    <div class="charts-row">
      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>📊 费用类型分布</span>
          </div>
        </template>
        <div ref="pieChartRef" class="chart-box"></div>
      </el-card>

      <el-card shadow="never" class="chart-card">
        <template #header>
          <div class="chart-header">
            <span>📈 支出趋势 & AI 预测</span>
            <el-tag type="warning" effect="plain" size="small" style="margin-left: 10px">
              基于线性回归算法
            </el-tag>
          </div>
        </template>
        <div ref="lineChartRef" class="chart-box"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { Money, Wallet, PieChart } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import axios from 'axios'

// --- 状态定义 ---
const allData = ref<any[]>([])
const pieChartRef = ref(null)
const lineChartRef = ref(null)

// --- 计算属性 (基于全量数据做简单统计) ---
const totalAmount = computed(() => allData.value.reduce((sum, item) => sum + item.amount, 0))
const totalCount = computed(() => allData.value.length)
const currentMonthAmount = computed(() => {
  const nowStr = new Date().toISOString().slice(0, 7)
  return allData.value
    .filter((item) => item.date.startsWith(nowStr))
    .reduce((sum, item) => sum + item.amount, 0)
})
const lastUpdate = computed(() => {
  if (allData.value.length === 0) return '-'
  return allData.value[0].createTime?.replace('T', ' ').slice(0, 16) || '刚刚'
})

const topCategory = ref('-')
const topCategoryPercent = ref('0')

// --- 核心逻辑 ---
onMounted(async () => {
  await fetchData()
  window.addEventListener('resize', handleResize)
})

const fetchData = async () => {
  try {
    // 1. 获取列表用于计算顶部卡片和饼图 (保持不变)
    const listRes = await axios.get('http://localhost:8080/api/doc/list')
    allData.value = listRes.data
    calculateTopCategory()

    // 渲染饼图
    nextTick(() => {
      if (pieChartRef.value) renderPieChart()
    })

    // 2. 获取趋势预测数据 (新增逻辑)
    const trendRes = await axios.get('http://localhost:8080/api/stats/trend')
    if (trendRes.data.code === 200) {
      nextTick(() => {
        if (lineChartRef.value) renderLineChart(trendRes.data.data) // 传入后端算好的预测数据
      })
    }
  } catch (error) {
    console.error('获取数据失败', error)
  }
}

const calculateTopCategory = () => {
  if (allData.value.length === 0) return
  const map: Record<string, number> = {}
  allData.value.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + 1
  })
  let max = 0
  let name = ''
  for (const key in map) {
    if (map[key] > max) {
      max = map[key]
      name = key
    }
  }
  topCategory.value = name
  topCategoryPercent.value = ((max / totalCount.value) * 100).toFixed(1)
}

// --- ECharts 图表渲染 ---
let pieChart: any = null
let lineChart: any = null

const renderPieChart = () => {
  pieChart = echarts.init(pieChartRef.value)

  // 数据聚合
  const map: Record<string, number> = {}
  allData.value.forEach((item) => {
    map[item.category] = (map[item.category] || 0) + item.amount
  })
  const data = Object.keys(map).map((key) => ({ value: map[key], name: key }))

  // 配置
  pieChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: '0%', left: 'center' },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
    series: [
      {
        name: '费用分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
        data: data,
      },
    ],
  })
}

// 核心修改：渲染折线图 (包含预测)
const renderLineChart = (chartData: any) => {
  lineChart = echarts.init(lineChartRef.value)

  // 构造 X 轴：历史月份 + 下月预测
  const xData = [...chartData.months, '下月预测']

  // 构造 Y 轴数据
  // 1. 真实数据系列：最后补一个 null，为了让实线在这里断开
  const realSeries = [...chartData.amounts, null]

  // 2. 预测数据系列：前面补 null，只画最后一段虚线
  // 为了让虚线和实线连接起来，预测系列的起点必须是真实数据的最后一个点
  const lastRealValue = chartData.amounts[chartData.amounts.length - 1] || 0
  const predictSeries = new Array(chartData.amounts.length - 1).fill(null)
  predictSeries.push(lastRealValue) // 连接点
  predictSeries.push(Number(chartData.prediction).toFixed(2)) // 预测点

  lineChart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: xData },
    yAxis: { type: 'value' },
    legend: { data: ['实际支出', 'AI预测'] },
    series: [
      {
        name: '实际支出',
        type: 'line',
        data: realSeries,
        smooth: true,
        lineStyle: { width: 3, color: '#409EFF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.5)' },
            { offset: 1, color: 'rgba(64,158,255,0.01)' },
          ]),
        },
      },
      {
        name: 'AI预测',
        type: 'line',
        data: predictSeries,
        smooth: false, // 预测线一般用直线表示线性回归
        lineStyle: { width: 3, color: '#E6A23C', type: 'dashed' }, // 虚线
        itemStyle: { color: '#E6A23C' },
        label: {
          show: true,
          position: 'top',
          formatter: '预测\n¥{c}',
          fontSize: 12,
          color: '#E6A23C',
        },
      },
    ],
  })
}

const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;
}

/* 顶部卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.card-item {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}
.card-content {
  z-index: 2;
  position: relative;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.label {
  color: #909399;
  font-size: 14px;
}
.value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  font-family: monospace;
}
.footer {
  font-size: 12px;
  color: #c0c4cc;
}

/* 图标背景装饰 */
.icon-bg {
  position: absolute;
  right: -10px;
  bottom: -10px;
  font-size: 100px;
  opacity: 0.1;
  transform: rotate(-15deg);
}
.icon-bg.success {
  color: #67c23a;
}
.icon-bg.warning {
  color: #e6a23c;
}
.icon-bg.primary {
  color: #409eff;
}

/* 图表区 */
.charts-row {
  display: flex;
  gap: 24px;
  flex: 1;
  min-height: 400px;
}
.chart-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
}
.chart-header {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
  display: flex;
  align-items: center;
}
.chart-box {
  width: 100%;
  height: 350px; /* 固定高度 */
  margin-top: 10px;
}

@media (max-width: 1000px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  .charts-row {
    flex-direction: column;
  }
}
</style>
