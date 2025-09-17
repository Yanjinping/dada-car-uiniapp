<template>
  <view class="stepbar">
    <!-- 轨道线：放在底层 -->
    <view class="rail"></view>
    <view class="rail-active" :class="{ full: current === 3 }"></view>

    <!-- 三个步骤：放在上层 -->
    <view class="steps">
		
<!-- 步骤1 -->
<view class="step">
  <view class="dot" :class="current >= 1 ? 'dot-active' : 'dot-todo'">
    <text class="num" :class="current >= 1 ? 'num-active' : 'num-todo'">1</text>
  </view>
  <text class="label" :class="current >= 1 ? 'label-active' : 'label-todo'">还车照片</text>
</view>

<!-- 步骤2 -->
<view class="step">
  <view class="dot" :class="current >= 2 ? 'dot-active' : 'dot-todo'">
    <text class="num" :class="current >= 2 ? 'num-active' : 'num-todo'">2</text>
  </view>
  <text class="label" :class="current >= 2 ? 'label-active' : 'label-todo'">订单支付</text>
</view>

<!-- 步骤3 -->
<view class="step">
  <view class="dot" :class="current >= 3 ? 'dot-active' : 'dot-todo'">
    <text class="num" :class="current >= 3 ? 'num-active' : 'num-todo'">3</text>
  </view>
  <text class="label" :class="current >= 3 ? 'label-active' : 'label-todo'">确认还车</text>
</view>
	  
    </view>
  </view>
</template>


<script setup>
const props = defineProps({
  current: { type: Number, default: 1 } // 1/2/3
})
</script>



<style scoped>
.stepbar{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  padding: 24rpx 32rpx 8rpx;
  background:#FFFFFF;
}

/* 每个 step */
.step{
   flex:1;
  display:flex;
  flex-direction: column; /* 改这里：上下排列 */
  align-items:center;     /* 横向居中 */
  position:relative
  
}

/* 圆点基底 */
.dot{
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius:50%;
  box-sizing:border-box;
  z-index:1;
}
.dot-active{
  width:44rpx;
  height:44rpx;
  background:#1BBD43; /* 标注：圆形41 */
}
.dot-todo{
  width:40rpx;
  height:40rpx;
  background:#F5F5F5; /* 标注：圆形42 */
}

/* 数字样式 */
.num{
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight:400;
  font-style:normal;
  text-align:center;
  line-height:1;
}
.num-active{
  font-size:26rpx;
  line-height:36rpx;
  color:#FFFFFF; /* 标注：图层1 */
}
.num-todo{
  font-size:24rpx;
  line-height:32rpx;
  color:#AAAAAA; /* 标注：图层2、3 */
}

/* 标签文字 */
.label{
  margin-top: 8rpx;   /* 圆点和文字之间的间距 */
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight:400;
  font-size:28rpx;
  line-height:38rpx;
  text-align: center; /* 保证文字居中 */
}
.label-active{ color:#222222; }  /* 标注：还车照片 */
.label-todo{ color:#888888; }     /* 标注：订单支付 */

/* === 单一版本，覆盖旧样式 === */
.stepbar{
  --padX: 1rpx;       /* ← 左右边距，想更靠边就调小 */
  --padTop: 24rpx;    /* 顶部内边距 */
  --stepW: 210rpx;     /* 每个锚点占位宽度（≈圆点直径） */
  position: relative;
  display:flex;
  padding: var(--padTop) var(--padX) 8rpx;
  background:#FFFFFF;
}

.steps{
  width:100%;
  display:flex;
  justify-content:space-between;  /* 左/中/右三锚点 */
  position:relative;
  z-index:2;
}

/* 关键：不再均分整行 */
.step{
  flex: 0 0 var(--stepW);          /* ← 固定锚点宽度 */
  display:flex;
  flex-direction: column;
  align-items:center;
  position:relative;
}

/* 轨道线：永远穿过三个圆心 */
.rail,
.rail-active{
  position:absolute;
  top: calc(var(--padTop) + 22rpx);  /* 正好过 44rpx 圆点的圆心 */
  height:4rpx;
  border-radius:999rpx;
}

.rail{
  left:  calc(var(--padX) + var(--stepW)/2);
  right: calc(var(--padX) + var(--stepW)/2);
  background:#EEEEEE;
  z-index:0;
}

/* 默认到第二个圆心（①→②） */
.rail-active{
  left:  calc(var(--padX) + var(--stepW)/2);
  right: calc(40% + var(--stepW)/2);
  background: linear-gradient(90deg,#1BBD43 0%, #EEEEEE 100%);
  z-index:1;
}

/* current === 3 时全绿（①→③） */
.rail-active.full{
  right: calc(var(--padX) + var(--stepW)/2);
  background:#1BBD43;
}


/* 你的 .step/.label 纵向排布保持 */
.step{
  flex:1;
  display:flex;
  flex-direction: column;
  align-items:center;
  position:relative;
}
.label{
  margin-top: 8rpx;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight:400;
  font-size:28rpx;
  line-height:38rpx;
  text-align: center;
}

</style>
