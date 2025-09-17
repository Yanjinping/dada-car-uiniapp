<!-- pages/wallet/detail.vue -->
<template>
  <view class="page">
   <!-- 顶部导航（自定义） -->
   <TitleBar title="小钱包明细" background="#FFFFFF">
       <!-- 右侧可放占位或图标 -->
       <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
     </TitleBar>

    <!-- 列表 -->
    <scroll-view
      class="list-wrap"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onPullDown"
      @scrolltolower="loadMore"
    >
      <view v-if="records.length === 0 && !loading" class="empty">
        暂无明细
      </view>

      <view v-for="(it, i) in records" :key="i" class="row">
        <view class="row-left">
          <view class="coin">
            <text class="coin-sym">￥</text>
          </view>
          <view class="title">
            {{ rowTitle(it) }}
          </view>
        </view>
        <view class="row-right">{{ formatTime(it) }}</view>
      </view>

      <!-- 底部状态 -->
      <view class="footer-tip" v-if="loading">加载中...</view>
      <view class="footer-tip" v-else-if="finished && records.length">没有更多了</view>
      <view style="height: 24rpx;" />
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'

// 你的 wallet.js 里原本导出了 getBalance（在你首条代码里有 import { getAllBalances, getBalance }）
import { getBalance as getBalanceRecords } from '../../api/wallet.js'

const userId = uni.getStorageSync('userId') || 1

// 列表状态
const page = ref(1)
const pageSize = ref(20)
const records = ref([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)

// 文案：根据 type 决定“充值/扣除”
function rowTitle(item) {
  const t = (item?.type || item?.recordType || '').toLowerCase()
  const amt = Number(item?.amount || 0)
  const money = Math.abs(amt).toFixed(0) // 蓝湖是整数展示：50元
  if (t === 'income') return `余额充值${money}元`
  if (t === 'expense') return `余额扣除${money}元`
  // 若后端仅有正负号
  if (amt >= 0) return `余额充值${money}元`
  return `余额扣除${money}元`
}

function formatTime(item) {
  const raw =
    item?.createdAt ||
    item?.createTime ||
    item?.created_time ||
    item?.time ||
    ''
  const d = raw ? new Date(raw) : new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

async function fetchList({ reset = false } = {}) {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    if (reset) {
      page.value = 1
      finished.value = false
      records.value = []
    }
    const params = {
      userId,
      page: page.value,
      pageSize: pageSize.value,
      moneyType: 'accountBalance', // 与充值页一致
    }
    // 你的接口：getBalance / getBalanceRecords 返回 { data: { list, total } } 或 { list, total }
    const res = await getBalanceRecords(params)
    const data = res?.data || res || {}
    const list = data.list || data.records || []
    const total = Number(data.total || data.count || 0)
    records.value = records.value.concat(list)
    // 完结判断（兼容后端未返回 total 的情况）
    if ((records.value.length >= total && total > 0) || list.length < pageSize.value) {
      finished.value = true
    } else {
      page.value += 1
    }
  } catch (e) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
    if (refreshing.value) {
      refreshing.value = false
      uni.stopPullDownRefresh?.()
    }
  }
}

function loadMore() {
  if (!loading.value && !finished.value) fetchList()
}

function onPullDown() {
  refreshing.value = true
  fetchList({ reset: true })
}

function goBack() {
  uni.navigateBack({ delta: 1 })
}

onMounted(() => fetchList({ reset: true }))
onReachBottom(loadMore)
onPullDownRefresh(onPullDown)
</script>

<style scoped lang="scss">
.page { background:#fff; min-height:100vh; }

/* 顶部导航（与钱包页一致，仅一个返回） */
.nav{ height: 96rpx; display:flex; align-items:center; position: sticky; top:0; z-index:10; background:#fff; }
.nav-back{ width:120rpx; font-size:44rpx; padding-left:24rpx; }
.nav-title{ flex:1; text-align:center; font-size:36rpx; font-weight:600; color:#333; }
.nav-right{ width:120rpx; }

/* 列表容器 */
.list-wrap{ height: calc(100vh - 96rpx); }

/* 行样式对齐蓝湖 */
.row{
  padding: 28rpx 24rpx;
  display:flex; align-items:center; justify-content:space-between;
  border-bottom: 1rpx solid #F0F0F0;
}
.row-left{ display:flex; align-items:center; gap: 20rpx; }
.coin{
  width: 56rpx; height:56rpx; border-radius: 50%;
  background: #FFA673;
  display:flex; align-items:center; justify-content:center;
}
.coin-sym{ color:#fff; font-size: 28rpx; font-weight: 700; }
.title{ font-size: 30rpx; color:#333; font-weight: 600; }
.row-right{ font-size: 26rpx; color:#999; }

/* 空状态与底部提示 */
.empty{ text-align:center; color:#888; padding: 60rpx 0; }
.footer-tip{ text-align:center; color:#999; padding: 20rpx 0; }
</style>
