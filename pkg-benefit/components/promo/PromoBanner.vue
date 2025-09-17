<template>
  <view class="banner">
    <!-- 右上：奖励规则 -->
    <view class="rules" @tap="$emit('open-rules')">奖励规则</view>

    <!-- 顶部品牌（可要可不要） -->
    <!-- <image class="logo" src="/static/icons/dada.png" mode="widthFix" /> -->

    <!-- 第一行：邀请好友 + 完成首单（在右侧） -->
    <view class="row row-top">
      <text class="title-invite">邀请好友</text>
      <view class="chip"><text class="chip-text">完成首单</text></view>
    </view>

    <!-- 第二行：赚现金红包（在左，车在右） -->
    <view class="row row-bottom">
      <text class="reward normal">赚</text>
      <text class="reward cash">现金</text>
      <text class="reward normal">红包</text>
    </view>

    <!-- 车：固定在右侧，覆盖在两行右边 -->
    <image class="car" src="/static/car1.png" mode="widthFix" />
  </view>
</template>

<script setup>
defineEmits(['open-rules'])
</script>

<style scoped>
/* 容器 */
.banner{
  position: relative;

  padding: 36rpx 24rpx 10rpx;
  border-radius: 24rpx;
}

/* 右上规则 */
.rules{
  position:absolute; right:0rpx; top:44rpx;
  padding:10rpx 16rpx; border-radius:20rpx;
  background:rgba(0,0,0,.15); color:#fff; font-size:24rpx;
}

/* 品牌 */
.logo{ width:160rpx; }

/* 行：给右侧车预留空间，避免文字被挤/覆盖 */
.row{ padding-right: 300rpx; }
.row-top{ margin-top: 20rpx; display:flex; align-items:center; gap:16rpx; }
.row-bottom{ margin-top: 8rpx; display:flex; align-items:flex-end; gap:6rpx; }

/* 邀请好友 */
.title-invite{
  font-family:"HelloFont WenYiHei","PingFang SC",sans-serif;
  font-weight:400; font-size:72rpx; color:#fff;
  line-height:100rpx;
  letter-spacing:-6rpx;         /* 约等于 -10% 视觉 */
  white-space:nowrap;           /* 禁止换行/竖排 */
  writing-mode: horizontal-tb;  /* 强制横排，防止环境样式干扰 */
}

/* 完成首单 chip */
.chip{
  height:72rpx; min-width:184rpx; padding:0 20rpx;
  border-radius:40rpx; border:2rpx solid #fff;
  background:linear-gradient(35deg,#73FBE3 0%, #F7F28D 100%);
  display:flex; align-items:center; justify-content:center;
}
.chip-text{
  font-family:"HelloFont WenYiHei","PingFang SC",sans-serif;
  font-size:36rpx; line-height:50rpx; color:#222;
  white-space:nowrap;
}

/* 赚现金红包 */
.reward{
  font-family:"HelloFont WenYiHei","PingFang SC",sans-serif;
  font-size:78rpx; line-height:118rpx; font-weight:500;
  white-space:nowrap; writing-mode:horizontal-tb;
}
.reward.normal{ color:#222; }
.reward.cash{ color:#FE4100; }

/* 车在右边（不挤占文流），略压标题更有气氛 */
.car{
  position:absolute; right:0rpx; bottom:30rpx;
  width:268rpx; z-index:2; pointer-events:none;
}

/* 窄屏余量（可按机型再调） */
@media (max-width: 360px){
  .row{ padding-right: 320rpx; }
}
</style>
