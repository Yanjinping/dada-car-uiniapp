<template>
  <view class="card">
    <!-- 邀请链接区域 -->
    <view class="link-row">
      <image class="ic" src="/static/icons/link.png" />
      <text class="txt">复制邀请链接给好友：{{ link }}</text>
      <button class="btn-copy" @tap="$emit('copy-link', link)">复制</button>
    </view>

    <!-- 金额展示 -->
    <view class="amount-wrap">
      <text class="hint">已邀请{{ inviteCount }}位好友完成首单，可领现金红包</text>
      <view class="amt-line">
        <text class="yen">¥</text><text class="amt">{{ amount }}</text>
        <text class="tag">可提现</text>
      </view>
      <text class="sub">{{ progressText }}</text>
    </view>

    <!-- 操作按钮 -->
    <view class="ops">
      <button class="btn ghost" @tap="$emit('save-poster')">保存海报</button>
      <button class="btn primary" open-type="share" @tap="$emit('send-friend')">发给好友</button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  amount: { type: [Number, String], default: 0 },
  inviteCount: { type: Number, default: 0 },
  link: { type: String, default: '' },
  progressText: { type: String, default: '' }
})
defineEmits(['copy-link','save-poster','send-friend'])
</script>

<style scoped>
.card{ margin:24rpx; padding:20rpx; border-radius:24rpx; background:#fff5eb; border:6rpx solid #ffd67a; box-shadow:0 12rpx 40rpx rgba(255,109,0,.12);}
.link-row{ display:flex; align-items:center; gap:14rpx; background:#fff; border-radius:16rpx; padding:14rpx 16rpx;}
.ic{ width:32rpx; height:32rpx;}
.txt{ flex:1; font-size:26rpx; color:#333; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
.btn-copy{ padding:0 24rpx; height:56rpx; line-height:56rpx; border-radius:28rpx; background:#4cd964; color:#fff; font-size:26rpx;}
.amount-wrap{ margin-top:22rpx; background:#fff; border-radius:20rpx; padding:30rpx 24rpx 12rpx;}
.hint{ color:#ff6a00; font-size:26rpx;}
.amt-line{ display:flex; align-items:flex-end; gap:8rpx; margin:14rpx 0;}
.yen{ font-size:36rpx; color:#ff2333; font-weight:800;}
.amt{ font-size:120rpx; color:#ff2333; font-weight:900; line-height:1;}
.tag{ margin-left:12rpx; padding:6rpx 14rpx; border:2rpx solid #36c38c; color:#36c38c; border-radius:999rpx; font-size:22rpx;}
.sub{ color:#b85b00; font-size:26rpx;}
.ops{ margin-top:14rpx; display:flex; justify-content:space-between; gap:24rpx; padding:20rpx 0 6rpx;}
.btn{ flex:1; height:96rpx; line-height:96rpx; border-radius:999rpx; font-size:32rpx; font-weight:700;}
.btn.ghost{ background:linear-gradient(180deg,#fff7d1,#ffe894); color:#d44800;}
.btn.primary{ background:linear-gradient(180deg,#ffe07a,#ffb14b); color:#a01d00;}
</style>
