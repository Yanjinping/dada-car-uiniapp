<!-- src/components/login/AgreeLine.vue -->
<template>
  <view class="agree" @tap="toggle">
    <view class="txt" :class="{ checked: props.checked }">
      未注册手机号登录后自动生成账号，且代表您已阅读并同意
      <text class="link" @tap.stop="$emit('service')">《服务协议》</text>
      <text class="link" @tap.stop="$emit('privacy')">《隐私协议》</text>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  /** 与父组件 v-model:checked 绑定 */
  checked: { type: Boolean, default: false }
})
/** 一定要声明 update:checked，否则会出现你看到的 warning */
const emit = defineEmits(['update:checked', 'service', 'privacy'])

const toggle = () => {
  emit('update:checked', !props.checked)
}
</script>

<style scoped>
.agree{
  width:100%;                 /* 外层容器控制最终宽度，例如 620rpx */
  font-size:26rpx;
  line-height:40rpx;
  color:#A6A6A6;
}

/* 文字容器，左侧预留 36+12=48rpx 画圆与勾 */
.txt{
  position:relative;
  padding-left:48rpx;
  white-space:normal;
  word-break:break-word;
}

/* 未勾选：灰色空心圆 */
.txt::before{
  content:'';
  position:absolute;
  left:0; top:3rpx;           /* (40-36)/2 ≈ 2rpx，贴合首行中线 */
  width:36rpx; height:36rpx;
  border-radius:50%;
  background:#fff;
  border:2rpx solid #A6A6A6;
}

/* 对勾：默认透明（未勾选不显示） */
.txt::after{
  content:'';
  position:absolute;
  left:14rpx; top:10rpx;       /* 圆内微调 */
  width:10rpx; height:19rpx;
  border-right:4rpx solid transparent;
  border-bottom:4rpx solid transparent;
  transform:rotate(45deg);
  border-radius:2rpx;
}

/* 勾选态：绿底 + 白勾 */
.txt.checked::before{
  background:#07BF4A;
  border-color:#07BF4A;
}
.txt.checked::after{
  border-right-color:#fff;
  border-bottom-color:#fff;
}

.link{ color:#07BF4A; margin-left:6rpx; }
</style>
