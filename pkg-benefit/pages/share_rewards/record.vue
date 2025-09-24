<template>
  <view class="page">
    <TitleBar title="晒单记录" />

    <!-- 顶部Tabs -->
    <view class="tabs">
      <view
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: t.key===activeTab }"
        @tap="switchTab(t.key)"
      >
        {{ t.text }}<text v-if="countMap[t.key]!==undefined" class="badge">{{ countMap[t.key] }}</text>
      </view>
    </view>

    <!-- 统计条 -->
    <view class="summary">
      已发放优惠券：<text class="strong">¥{{ stats.granted || 0 }}</text>，
      待发放：<text class="strong">¥{{ stats.pending || 0 }}</text>
    </view>

    <!-- 列表区域 -->
    <scroll-view
      class="list"
      scroll-y
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onReachBottom"
    >
      <!-- 骨架屏 -->
      <view v-if="loading && records.length===0" class="skeleton-wrap">
        <view v-for="i in 3" :key="i" class="skeleton-card"></view>
      </view>

      <!-- 空状态 -->
      <view v-else-if="!loading && records.length===0" class="empty">
        <image class="empty-icon" src="https://img.alicdn.com/imgextra/i1/O1CN01empty.png" mode="aspectFit" />
        <text class="empty-text">还没有晒单记录</text>
        <button class="btn primary" @tap="goPost">去晒单</button>
      </view>

      <!-- 记录卡片 -->
      <view v-else>
        <view v-for="it in records" :key="it.id" class="card">
          <view class="card-hd">
            <view class="order-line">
              <text class="label">订单</text>
              <text class="mono">{{ it.orderNum }}</text>
            </view>
            <view class="status" :class="statusClass(it.status)">
              {{ statusText(it.status) }}
            </view>
          </view>

          <view class="content">
            <view class="text" v-if="it.content">{{ it.content }}</view>
            <view class="imgs" v-if="(it.images||[]).length">
              <image
                v-for="(img,idx) in (it.images||[]).slice(0,3)"
                :key="idx"
                :src="img"
                class="thumb"
                mode="aspectFill"
                @tap="preview(it.images, idx)"
              />
              <view v-if="(it.images||[]).length>3" class="more">+{{ it.images.length-3 }}</view>
            </view>
          </view>

          <!-- 奖励信息 -->
          <view class="reward">
            <view class="row">
              <text class="label">奖励</text>
              <text class="val">10元优惠券</text>
              <text
                class="tag"
                :class="{
                  green: it.reward?.status==='SENT',
                  orange: it.reward?.status==='PENDING',
                  gray: it.reward?.status==='NA'
                }"
              >{{ rewardText(it.reward?.status) }}</text>
            </view>
            <view class="row small">
              <text class="label">提交时间</text>
              <text class="val">{{ fmt(it.createdAt) }}</text>
            </view>
            <view class="row small" v-if="it.status==='REJECTED' && it.rejectReason">
              <text class="label">驳回原因</text>
              <text class="val danger">{{ it.rejectReason }}</text>
            </view>
          </view>

          <!-- 操作区 -->
          <view class="ops">
            <button class="btn ghost" @tap="copy(it.copyText || buildCopy(it))">复制文案</button>
            <button class="btn" v-if="it.status==='REJECTED'" @tap="repost(it)">重新提交</button>
            <button class="btn" v-else @tap="viewDetail(it)">查看详情</button>
            <button class="btn danger ghost" @tap="remove(it)">删除</button>
          </view>
        </view>

        <!-- 底部加载/没有更多 -->
        <view class="footer-tip">
          <text v-if="loadingMore">加载中…</text>
          <text v-else-if="noMore">没有更多了</text>
        </view>
      </view>
    </scroll-view>

    <!-- 悬浮发布按钮 -->
    <view class="fab" @tap="goPost">+</view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'
import { apiShareRecords, apiShareStats } from '../../api/shareOrder'

const tabs = [
  { key: 'ALL', text: '全部' },
  { key: 'PENDING', text: '审核中' },
  { key: 'APPROVED', text: '已通过' },
  { key: 'REJECTED', text: '未通过' }
]

const activeTab = ref('ALL')
const records = ref([])
const page = reactive({ no: 0, size: 10 }) // 注意：Page 从 0 开始
const loading = ref(false)
const loadingMore = ref(false)
const noMore = ref(false)
const refreshing = ref(false)
const stats = reactive({ granted: 0, pending: 0 })
const countMap = reactive({})

onMounted(() => {
  fetchStats()
  fetchList(true)
})

function switchTab(k) {
  if (activeTab.value === k) return
  activeTab.value = k
  fetchList(true)
}

function onRefresh() {
  refreshing.value = true
  Promise.all([fetchStats(), fetchList(true)]).finally(() => (refreshing.value = false))
}

function onReachBottom() {
  if (loading.value || loadingMore.value || noMore.value) return
  loadingMore.value = true
  page.no += 1
  fetchList().finally(() => (loadingMore.value = false))
}

async function fetchStats() {
  try {
    const res = await apiShareStats()
    const data = res.data || res // 兼容 Result<T> 与直出
    if (data) {
      stats.granted = data.granted || 0
      stats.pending = data.pending || 0
      Object.assign(countMap, { ALL: undefined, ...(data.countMap || {}) })
    }
  } catch (e) {
    // 保持静默，沿用本地默认
  }
}

async function fetchList(reset = false) {
  if (reset) {
    page.no = 0
    noMore.value = false
    records.value = []
  }
  loading.value = page.no === 0
  try {
    const res = await apiShareRecords({
      status: activeTab.value === 'ALL' ? null : activeTab.value,
      page: page.no,
      size: page.size
    })
    const data = res.data || res // 兼容 Result<T> 与直出
    const list = data?.content || []
    // 字段适配：后端 item.ridePhotos -> 前端卡片展示用 images
    const adapted = list.map(it => ({
      ...it,
      images: Array.isArray(it.ridePhotos) ? it.ridePhotos : (it.ridePhotos ? JSON.parse(it.ridePhotos) : []),
      reward: it.reward || { status: it.rewardStatus } // 兼容旧字段
    }))
    records.value = records.value.concat(adapted)
    if (list.length < page.size) noMore.value = true
  } finally {
    loading.value = false
  }
}

function viewDetail(it) {
  uni.navigateTo({ url: `/pkg-benefit/pages/share_rewards/detail?id=${it.id}` })
}
function goPost() {
  uni.navigateTo({ url: '/pkg-benefit/pages/share_rewards/post' })
}
function repost(it) {
  uni.navigateTo({ url: `/pkg-benefit/pages/share_rewards/post?repostId=${it.id}` })
}
function copy(text) {
  uni.setClipboardData({ data: text })
}
function statusText(s) {
  return s === 'PENDING' ? '审核中' : s === 'APPROVED' ? '已通过' : s === 'REJECTED' ? '未通过' : '—'
}
function statusClass(s) {
  return s === 'PENDING' ? 'orange' : s === 'APPROVED' ? 'green' : s === 'REJECTED' ? 'red' : ''
}
function rewardText(s) {
  return s === 'SENT' ? '已发放' : s === 'PENDING' ? '待发放' : '—'
}
function fmt(val) {
  if (!val) return ''
  const d = new Date(val)
  const p = n => (n < 10 ? '0' + n : n)
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function preview(urls, current = 0) {
  uni.previewImage({ urls, current })
}
function buildCopy(it) {
  return `#嗒嗒好礼# 晒单领10元优惠券\n订单：${it.orderNum}\n用车体验不错，推荐～`
}
</script>


<style scoped>
.page { min-height: 100vh; background: #f6f7fb; }
.tabs { display: flex; padding: 12rpx 24rpx; gap: 16rpx; background: #fff; position: sticky; top: 0; z-index: 5; }
.tab { padding: 14rpx 22rpx; font-size: 26rpx; color: #666; background: #f2f3f5; border-radius: 999rpx; }
.tab.active { color: #fff; background: #ff7a00; }
.badge { margin-left: 8rpx; font-size: 22rpx; }
.summary { padding: 12rpx 24rpx; font-size: 24rpx; color: #666; }
.strong { color: #ff7a00; font-weight: 600; }

.list { height: calc(100vh - 220rpx); padding: 0 24rpx 120rpx; box-sizing: border-box; }
.card { background: #fff; border-radius: 20rpx; padding: 22rpx; margin: 18rpx 0; box-shadow: 0 6rpx 14rpx rgba(0,0,0,.04); }
.card-hd { display:flex; justify-content: space-between; align-items:center; margin-bottom: 12rpx; }
.order-line .label { background:#f6f7fb; color:#999; font-size: 22rpx; padding: 4rpx 10rpx; border-radius: 8rpx; margin-right: 8rpx; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; color:#333; }
.status { font-size: 24rpx; padding: 6rpx 14rpx; border-radius: 999rpx; }
.status.green { background:#e8ffea; color:#1a7f37; }
.status.orange { background:#fff7e6; color:#ad6800; }
.status.red { background:#fff1f0; color:#a8071a; }

.content .text { font-size: 26rpx; color:#333; line-height: 1.5; margin: 8rpx 0 10rpx; }
.imgs { display:flex; gap: 10rpx; position: relative; }
.thumb { width: 180rpx; height: 180rpx; border-radius: 12rpx; background:#f2f3f5; }
.more { position:absolute; right: 10rpx; bottom: 10rpx; font-size: 24rpx; color: #fff; background: rgba(0,0,0,.4); padding: 4rpx 10rpx; border-radius: 999rpx; }

.reward { margin-top: 10rpx; padding-top: 10rpx; border-top: 1rpx dashed #eee; }
.row { display:flex; align-items:center; gap: 14rpx; margin: 8rpx 0; }
.row.small { font-size: 24rpx; color:#666; }
.label { width: 120rpx; color:#999; font-size: 24rpx; }
.val { flex:1; color:#333; }
.tag { padding: 2rpx 10rpx; border-radius: 8rpx; font-size: 22rpx; }
.tag.green { background:#e8ffea; color:#1a7f37; }
.tag.orange { background:#fff7e6; color:#ad6800; }
.tag.gray { background:#f2f3f5; color:#888; }
.danger { color:#a8071a; }

.ops { display:flex; gap: 12rpx; margin-top: 12rpx; }
.btn { flex:1; padding: 16rpx; border-radius: 12rpx; font-size: 26rpx; background:#ff7a00; color:#fff; text-align:center; }
.btn.ghost { background:#fff; color:#ff7a00; border: 2rpx solid #ff7a00; }
.btn.danger { color:#a8071a; border-color:#a8071a; }
.footer-tip { text-align:center; color:#999; font-size: 24rpx; padding: 20rpx 0; }

.empty { display:flex; flex-direction:column; align-items:center; padding: 80rpx 0; color:#999; }
.empty-icon { width: 220rpx; height: 220rpx; opacity:.8; }
.empty-text { margin: 16rpx 0 24rpx; }
.skeleton-wrap { padding: 12rpx 0; }
.skeleton-card { height: 220rpx; background: linear-gradient(90deg,#f2f3f5, #f7f8fa, #f2f3f5); background-size: 400% 100%; animation: shimmer 1.4s infinite; border-radius: 20rpx; margin: 18rpx 0; }
@keyframes shimmer { 0%{background-position:0 0} 100%{background-position:-400% 0} }

.fab { position: fixed; right: 24rpx; bottom: 120rpx; width: 96rpx; height: 96rpx; border-radius: 50%; background:#ff7a00; color:#fff; display:flex; align-items:center; justify-content:center; font-size: 48rpx; box-shadow: 0 10rpx 24rpx rgba(255,122,0,.35); }
</style>
