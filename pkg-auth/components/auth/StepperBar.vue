<template>
  <view class="stepper">
    <text class="tip">完善一下资料并通过认证，就可以开始用车啦！</text>

    <!-- ① 头部：只有点和线 -->
    <view class="head">
      <!-- 灰底全线 + 绿进度线 -->
      <view class="rail"></view>
      <view class="rail-active" :style="{ width: activeWidth }"></view>

      <!-- 三个点（无文字） -->
      <view class="head-steps">
        <view class="dot" :class="{ on: step>=1 }"><text class="num" :class="{ on: step>=1 }">1</text></view>
        <view class="dot" :class="{ on: step>=2 }"><text class="num" :class="{ on: step>=2 }">2</text></view>
        <view class="dot" :class="{ on: step>=3 }"><text class="num" :class="{ on: step>=3 }">3</text></view>
      </view>
    </view>

    <!-- ② 文字：单独一行，与上面的点用相同的分布方式 -->
    <view class="labels">
      <text class="label" :class="{ active: step===1 }">身份证信息</text>
      <text class="label" :class="{ active: step===2 }">人脸照片</text>
      <text class="label" :class="{ active: step===3 }">驾驶证信息</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({ step: { type: Number, default: 1 } })

// 第一段想要的绿线比例（自己微调 0.18 ~ 0.26 都可）
const FIRST_STEP_PERCENT = 0.40

function calcActiveWidth(step) {
  if (step <= 1) return (FIRST_STEP_PERCENT * 100) + '%'  // ✅ 第一步也显示绿线
  if (step === 2)  return '50%'
  return '100%'
}

const activeWidth = calcActiveWidth(props.step)
</script>


<style scoped>
/* 兜底色值（不依赖外部 token 也能还原） */
:root{
  --c-green: #22c55e;   /* 接近截图的微信绿 */
  --c-line:  #e6e6e6;   /* 未激活连线灰 */
  --c-text:  #111111;   /* 激活标签色 */
  --c-muted: #bfbfbf;   /* 未激活标签灰 */
  --pad-page: 32rpx;
  --pad:24rpx; --dot:36rpx;
}

.stepper{ padding: 20rpx 32rpx 0; background:#fff; }

/* 顶部提示 */
.tip{
  display:block; margin:0 0 28rpx;
  font-size:28rpx; line-height:48rpx; color:#666;
}

/* 头部区域：仅用于对齐圆点与轨道线 */
.head{
  position:relative;
  height: 44rpx;          /* 用最大圆点高度做基准 */
  
}

/* 轨道线：穿过圆心 */
.rail, .rail-active{
  position:absolute;
  /* 线从圆心到圆心：= padding + dot/2 */
  left: calc(var(--pad, 24rpx) + var(--dot, 36rpx) / 2);
  right: calc(var(--pad, 24rpx) + var(--dot, 36rpx) / 2);
  top: 42%;
  transform: translateY(-50%);
  height:4rpx; border-radius:999rpx;
}
.rail{ background:#E6E6E6; z-index:0; }
.rail-active{
  background: linear-gradient(90deg, #22C55E 0%, #9EE6BF 65%, #E6E6E6 100%);
  z-index:1; width:0;
}

/* 三个点（无文字） */
.head-steps{
  position:relative; z-index:2;
  display:flex;
  justify-content: space-between;  /* 让 1/2/3 左中右分布 */
  padding: 0 var(--pad, 40rpx);    /* ✅ 控制 1、3 到两侧的间距 */              /* 水平/垂直都居中 */
}

/* 点/数字（与你之前一致） */
.dot{
  width:36rpx; height:36rpx; border-radius:50%;
  background:#fff; border:2rpx solid #e6e6e6; box-sizing:border-box;
  display:flex; align-items:center; justify-content:center;
}
.dot.on{ background:#22C55E; border-color:#22C55E; }
.num{ font-size:22rpx; line-height:36rpx; color:#c2c2c2; font-weight:500; }
.num.on{ color:#fff; }

/* 文字行：与上面点保持相同的分布方式 */
.labels{
  display:flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-top:16rpx;
}
.label{ min-width:140rpx; text-align:center; font-size:28rpx; line-height:38rpx; color:#bfbfbf; }
.label.active{ color:#111; font-weight:600; }

</style>
