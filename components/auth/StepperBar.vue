<template>

  <view class="stepper">

    <text class="tip">完善一下资料并通过认证，就可以开始用车啦！</text>

    <view class="bar">
      <!-- 点1 -->
      <view class="dot" :class="{ on: step >= 1 }">
        <text class="num" :class="{ on: step >= 1 }">1</text>
      </view>
      <!-- 线1：step>=1 高亮 -->
      <view class="line" :class="{ on: step >= 1 }"></view>

      <!-- 点2 -->
      <view class="dot" :class="{ on: step >= 2 }">
        <text class="num" :class="{ on: step >= 2 }">2</text>
      </view>
      <!-- 线2：step>=2 高亮 -->
      <view class="line" :class="{ on: step >= 2 }"></view>

      <!-- 点3 -->
      <view class="dot" :class="{ on: step >= 3 }">
        <text class="num" :class="{ on: step >= 3 }">3</text>
      </view>
    </view>

    <view class="labels">
      <text class="label" :class="{ active: step === 1 }">身份证信息</text>
      <text class="label" :class="{ active: step === 2 }">驾驶证信息</text>
      <text class="label" :class="{ active: step === 3 }">人脸照片</text>
    </view>
  </view>
</template>

<script setup>
defineProps({ step: { type: Number, default: 1 } })
</script>

<style scoped>
/* 兜底色值（不依赖外部 token 也能还原） */
:root{
  --c-green: #22c55e;   /* 接近截图的微信绿 */
  --c-line:  #e6e6e6;   /* 未激活连线灰 */
  --c-text:  #111111;   /* 激活标签色 */
  --c-muted: #bfbfbf;   /* 未激活标签灰 */
  --pad-page: 32rpx;
}

.stepper{ padding: 20rpx var(--pad-page) 0; }

/* 顶部提示：左对齐、单行高 */
.tip{
  width: 600rpx;
  height: 38rpx;
  display: block;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 400;
  font-size: 28rpx;
  color: #666666;
  line-height: 38rpx;
  text-align: left;
  margin: 0 0 28rpx 0;
}

/* 进度条主行：点与线共高，线细、点略大 */
.bar{
  height: 40rpx;
  margin: 8rpx 0 0;       /* 去掉底部 6rpx，间距交给 .labels 控制 */
  padding: 0 28rpx;       /* 关键：与 .labels 一致 */
  display: flex;
  align-items: center;   /* 让点中心与线居中对齐（和截图一致） */
}

/* 点：未激活=白底+浅灰描边；激活=纯绿底 */
.dot{
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #fff;
  border: 2rpx solid #e6e6e6;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot.on{
  background: var(--c-green);
  border-color: var(--c-green);
}

/* 数字：未激活灰，激活白；字号偏小一档更贴图里感觉 */
.num{
  font-size: 22rpx;
  line-height: 36rpx;
  color: #c2c2c2;
  font-weight: 500;
}
.num.on{ color: #ffffff; }

/* 连线：细、圆角；第一段在 step>=1 就点亮 */
.line{
  flex: 1;
  height: 4rpx;
  background: var(--c-line);
  margin: 0 16rpx;
  border-radius: 4rpx;
}
.line.on{ background: var(--c-green); }

/* 标签：等分三列，激活加粗并更深色，位置正好在点下方 */
.labels{
  display: flex;
  justify-content: space-between; /* 让三项中心与三个点对齐 */
  align-items: flex-start;
  padding: 0 28rpx;               /* 与 .bar 完全一致 */
  margin-top: 16rpx;              /* ↑ 与进度条拉开距离 */
  /* 可选：如果你希望标签整体宽度与 tip 一致，可加 max-width */
  /* max-width: 600rpx; margin-left:auto; margin-right:auto; */
}
.label{
  /* 不再 33.33% 定宽，否则会偏移 */
  text-align: center;
  font-size: 28rpx;
  line-height: 38rpx;
  color: var(--c-muted);
  font-weight: 400;
  /* 给一点最小宽度，避免字多时偏移可读性下降 */
  min-width: 140rpx;
}
.label.active{
  color: var(--c-text);
  font-weight: 600;
}
</style>
