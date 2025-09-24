<template>
  <view class="page">
    <TitleBar title="晒单详情" />

    <view class="card">
      <view class="row between">
        <view>
          <view class="mono">订单：{{ detail.orderNum }}</view>
          <view class="small gray">提交时间：{{ fmt(detail.createdAt) }}</view>
        </view>
        <view class="status" :class="cls(detail.status)">{{ statusText(detail.status) }}</view>
      </view>

      <!-- 点评与图片 -->
      <view class="content">
        <view class="text">{{ detail.content }}</view>
        <view class="imgs" v-if="detail.ridePhotos?.length">
          <image
            v-for="(img,i) in detail.ridePhotos"
            :key="i"
            :src="img"
            class="thumb"
            mode="aspectFill"
            @tap="preview(detail.ridePhotos, i)"
          />
        </view>
        <view class="proof" v-if="detail.shareProof?.length">
          <view class="tip">分享截图</view>
          <image
            v-for="(img,i) in detail.shareProof"
            :key="'s'+i"
            :src="img"
            class="thumb"
            mode="aspectFill"
            @tap="preview(detail.shareProof, i)"
          />
        </view>
      </view>
    </view>

    <!-- 审核与奖励 -->
    <view class="card">
      <view class="sec-hd">审核&奖励</view>

      <view class="row">
        <text class="label">审核状态</text>
        <text class="val">{{ statusText(detail.status) }}</text>
      </view>
      <view class="row" v-if="detail.status==='REJECTED'">
        <text class="label">驳回原因</text>
        <text class="val danger">{{ detail.rejectReason || '—' }}</text>
      </view>

      <view class="row">
        <text class="label">奖励</text>
        <text class="val">
          10元优惠券
          <text class="tag" :class="rewardCls(detail.reward?.status)">
            {{ rewardText(detail.reward?.status) }}
          </text>
        </text>
      </view>
      <view class="row small gray">
        <text class="label">发放说明</text>
        <text class="val">通过后12小时内发至“我的-卡券”，有效期7天</text>
      </view>
    </view>

    <!-- 时间线 -->
    <view class="card">
      <view class="sec-hd">进度</view>
      <view class="timeline">
        <view class="node done">
          <view class="dot"></view><view class="txt">已提交 · {{ fmt(detail.createdAt) }}</view>
        </view>
        <view class="node" :class="{done: detail.status!=='PENDING'}">
          <view class="dot"></view><view class="txt">审核中</view>
        </view>
        <view class="node" :class="{done: detail.status==='APPROVED'}" v-if="detail.status!=='REJECTED'">
          <view class="dot"></view><view class="txt">审核通过</view>
        </view>
        <view class="node" :class="{done: detail.reward?.status==='SENT'}" v-if="detail.status==='APPROVED'">
          <view class="dot"></view><view class="txt">奖励已发放</view>
        </view>
        <view class="node" v-if="detail.status==='REJECTED'">
          <view class="dot danger"></view><view class="txt danger">未通过 · {{ detail.rejectReason || '' }}</view>
        </view>
      </view>
    </view>

    <!-- 操作 -->
    <view class="ops">
      <button class="btn ghost" @tap="copy(buildCopy(detail))">复制文案</button>
      <button class="btn primary" v-if="detail.status==='REJECTED'" @tap="repost">重新提交</button>
      <button class="btn danger ghost" @tap="remove">删除</button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'
import { apiShareDetail } from '../../api/shareOrder'

const raw = ref(null)              // 原始返回
const detail = computed(() => {
  if (!raw.value) return {}
  // 兼容 ridePhotos/shareProof：可能是 JSON 字符串或数组
  const parseArr = (v) => Array.isArray(v) ? v : (typeof v === 'string' && v.trim().startsWith('[') ? JSON.parse(v) : [])
  return {
    ...raw.value,
    ridePhotos: parseArr(raw.value.ridePhotos),
    shareProof: parseArr(raw.value.shareProof),
    reward: raw.value.reward || { status: raw.value.rewardStatus } // 兼容旧字段
  }
})

onLoad(async (options) => {
  // 1) UniApp 标准：options.id
  let id = options && options.id
  // 2) H5 兜底：location.search
  if (!id && typeof window !== 'undefined' && window.location && window.location.search) {
    const usp = new URLSearchParams(window.location.search)
    id = usp.get('id')
  }

  // 防御：null / 'null' / '' 都不请求
  if (!id || id === 'null') {
    uni.showToast({ title: '参数缺失：id', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 600)
    return
  }

  await fetchDetail(id)
})

async function fetchDetail(id) {
  uni.showLoading({ title: '加载中...', mask: true })
  try {
    const res = await apiShareDetail(id)         // GET /api/user/share/{id}
    raw.value = res.data || res                  // 兼容 Result<T>
  } catch (e) {
    uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
  } finally {
    uni.hideLoading()                            // 与 showLoading 配对
  }
}

function statusText(s){ return s==='PENDING'?'审核中':s==='APPROVED'?'已通过':s==='REJECTED'?'未通过':'—' }
function rewardText(s){ return s==='SENT'?'已发放':s==='PENDING'?'待发放':'—' }
function rewardCls(s){ return s==='SENT'?'green':s==='PENDING'?'orange':'gray' }
function cls(s){ return s==='PENDING'?'orange':s==='APPROVED'?'green':'red' }
function fmt(ts){
  if(!ts) return ''
  const d=new Date(ts); const p=n=>n<10?('0'+n):n
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
function preview(urls, current=0){ uni.previewImage({ urls, current }) }
function copy(text){ uni.setClipboardData({ data: text }) }
function buildCopy(it){ return `#嗒嗒好礼# 晒单领10元券\n订单：${it.orderNum}\n${it.content || '用车体验不错，推荐～'}` }

function repost(){
  const id = raw.value?.id
  if (!id) return
  uni.navigateTo({ url:`/pkg-benefit/pages/share_rewards/post?repostId=${id}` })
}
</script>


<style scoped>
.page{min-height:100vh;background:#f6f7fb;padding-bottom:24rpx}
.card{background:#fff;margin:18rpx 24rpx;border-radius:20rpx;padding:20rpx;box-shadow:0 6rpx 14rpx rgba(0,0,0,.04)}
.row{display:flex;align-items:center}
.between{justify-content:space-between}
.small{font-size:24rpx}
.gray{color:#888}
.mono{font-family:ui-monospace,Menlo,Consolas,monospace}
.status{font-size:24rpx;padding:6rpx 14rpx;border-radius:999rpx}
.status.green{background:#e8ffea;color:#1a7f37}
.status.orange{background:#fff7e6;color:#ad6800}
.status.red{background:#fff1f0;color:#a8071a}
.content .text{font-size:28rpx;color:#333;line-height:1.6;margin:10rpx 0}
.imgs,.proof{display:flex;gap:12rpx;flex-wrap:wrap;margin-top:6rpx}
.thumb{width:200rpx;height:200rpx;border-radius:12rpx;background:#f2f3f5}
.sec-hd{font-size:28rpx;color:#333;font-weight:600;margin-bottom:12rpx}
.label{width:150rpx;color:#999;font-size:24rpx}
.val{flex:1;color:#333}
.tag{margin-left:10rpx;padding:2rpx 10rpx;border-radius:8rpx;font-size:22rpx}
.tag.green{background:#e8ffea;color:#1a7f37}
.tag.orange{background:#fff7e6;color:#ad6800}
.tag.gray{background:#f2f3f5;color:#888}
.timeline{margin-top:4rpx}
.node{display:flex;align-items:center;margin:12rpx 0}
.dot{width:18rpx;height:18rpx;border-radius:50%;background:#d9d9d9;margin-right:10rpx}
.dot.danger{background:#a8071a}
.node.done .dot{background:#52c41a}
.txt{font-size:26rpx;color:#333}
.txt.danger{color:#a8071a}
.ops{display:flex;gap:12rpx;margin:24rpx 24rpx}
.btn{flex:1;padding:16rpx;border-radius:12rpx;text-align:center;font-size:28rpx}
.btn.primary{background:#ff7a00;color:#fff}
.btn.ghost{background:#fff;color:#ff7a00;border:2rpx solid #ff7a00}
.btn.danger{color:#a8071a;border-color:#a8071a}
</style>
