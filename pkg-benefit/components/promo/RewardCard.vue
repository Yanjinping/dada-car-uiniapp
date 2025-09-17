<template>
  <view class="card">
    <!-- 上半：白底金额区 -->
    <view class="amount-wrap">
      <text class="hint">
        已邀请{{ inviteCount }}位好友完成首单，可领现金红包
      </text>

      <view class="amt-line">
        <text class="yen">¥</text>
        <text class="amt">{{ amount }}</text>
        <text class="cash-tag">可提现</text>
      </view>

      <text class="progress">{{ progressText }}</text>
    </view>


    <!-- 下半：红色操作区 -->
    <view class="ops-wrap">
	    <image class="wave" :src="waveSvg" mode="scaleToFill" />
      <button class="btn ghost" @tap="$emit('save-poster')">保存海报</button>
      <button class="btn primary" open-type="share" @tap="$emit('send-friend')">
        发给好友
      </button>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  amount: { type: [Number, String], default: 0 },        // 金额数字
  inviteCount: { type: Number, default: 0 },             // 已邀请人数
  progressText: { type: String, default: '满5人再+10元，满10人再+30元' }
})
defineEmits(['save-poster','send-friend'])


const waveSvg =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 120" preserveAspectRatio="none">
  <!-- 这条路径是“起伏波浪”：两个波段，白色填充覆盖红底 -->
  <path d="M0,72 C120,112 240,32 375,72 C510,112 630,32 750,72 L750,0 L0,0 Z"
        fill="#FFFFFF"/>
</svg>`);
</script>

<style scoped>
/* 外容器：圆角+浅橙描边感 */
.card{
  margin: 24rpx;
  border-radius: 42rpx;
  overflow: hidden;
  box-shadow: 0 12rpx 40rpx rgba(255,109,0,.12);
  background: #fff2e7;                 /* 外围浅底 */
  border: 6rpx solid #FFD67A;
}

/* 白底金额区 */
.amount-wrap{
  background: #FFFFFF;
  border-radius: 28rpx;
  margin: 20rpx;
  padding: 30rpx 24rpx 16rpx;
}

/* 顶部提示（居中、#FF4C01、28rpx） */
.hint{
  display:block;
  text-align:center;
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-size: 28rpx;
  line-height: 38rpx;
  color:#FF4C01;
}

/* 金额行：¥ 60rpx + 数字 144rpx + 可提现 */
.amt-line{
  margin: 14rpx 0 10rpx;
  display:flex; align-items:flex-end; justify-content:center;
  gap: 8rpx;
}
.yen{
  font-family:"D-DIN","DIN Alternate","Arial Narrow",sans-serif;
  font-weight:700;
  font-size: 60rpx;
  line-height: 84rpx;
  color:#FF0130;
}
.amt{
  font-family:"D-DIN","DIN Alternate","Arial Narrow",sans-serif;
  font-weight:700;
  font-size: 144rpx;
  line-height: 1;
  color:#FF0130;
}
.cash-tag{
  margin-left: 14rpx;
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  background: #EFFFF2;
  border: 2rpx solid #1DC76A;
  color: #1DC76A;
  font-size: 22rpx;
  line-height: 28rpx;
  align-self: center;
}

/* 进度提示（居中、#FF4C01、28rpx） */
.progress{
  display:block;
  text-align:center;
  margin-top: 12rpx;
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-size: 28rpx;
  line-height: 38rpx;
  color:#FF4C01;
}

/* 下半：红色操作区（圆角+内阴影） */
.ops-wrap{
  margin: 0 20rpx 20rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #FF5C3A 0%, #FF2E24 100%);
  padding: 56rpx 22rpx 28rpx;
  display:flex; gap: 28rpx;
  position: relative;
  
}
.wave{
  position:absolute;
  left:-2%; right:-2%;
  top:-40rpx;         /* ↑ 波浪整体上移/下移：调这里 */
  height:100rpx;       /* ↑ 波浪高度（弧度大/小）：调这里 */
  width:104%;
  z-index:1;
  pointer-events:none;
}

/* 顶部中弧形装饰（可选，还原“弧线”氛围） */

/* 按钮样式：黄色渐变圆角，红色文案（44rpx 视觉） */
.btn{
  flex:1;
  height: 120rpx;                      /* 视觉更接近大圆钮 */
  border-radius: 999rpx;
  padding: 0;
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight: 500;
  font-size: 44rpx;
  line-height: 120rpx;
  text-align:center;
  color: #FF0130;
  box-shadow: inset 0 0 0 6rpx rgba(255,255,255,.5);
}
.btn.ghost,
.btn.primary{
  background: linear-gradient(180deg,#FFF2C0 0%, #FFE38A 70%, #FFD765 100%);
}
</style>
