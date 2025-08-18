<template>
  <view class="card" :class="state" @click="$emit('tap')">
    <!-- 预览或占位插画 -->
    <image v-if="img" :src="img" class="preview" mode="aspectFill" />
    <image v-else :src="placeholderSrc" class="illus" mode="aspectFill" />

    <!-- 中央胶囊按钮 -->
<view class="cta" v-if="!img">
  <text class="cta-text">
    {{ state === 'fail' ? '识别失败，请重新上传' : (placeholder || '拍照/上传') }}
  </text>
</view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  img: String,
  state: { type: String, default: 'idle' }, // idle | success | fail
  type:  { type: String, default: 'front' },// front | back
  placeholder: String
})
defineEmits(['tap'])

const placeholderSrc = computed(() =>
  props.type === 'back' ? '/static/auth/sfz-guo.png' : '/static/auth/sfz-ren.png'
)
</script>

<style scoped>
/* 卡片：550×330、圆角36、2rpx 虚线描边、#F7FBFF 底色 */
.card{
  position: relative;
  width: 550rpx;
  height: 330rpx;
  border-radius: 36rpx;
  background: #F7FBFF;
  border: 2rpx solid #E0EEF9; 
  overflow: hidden;
  box-sizing: border-box; /* 防止描边挤压尺寸 */
  margin: 0 auto; 
}

/* 预览图填充整个容器 */
.preview{ width: 100%; height: 100%; display:block; }

/* 占位插画：478×218、中心居中、80% 不透明 */
.illus{
  position:absolute;
  left:0; top:0; width:100%; height:100%;
  display:block;
  opacity:.8;              /* 蓝湖有淡化质感 */
  pointer-events:none;     /* 防止挡点击 */
  border-radius: inherit;  /* 贴合圆角 */
}

/* 中央胶囊按钮：168×72、圆角48、绿色 */
.cta{
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  width: 168rpx;
  height: 72rpx;
  border-radius: 48rpx;
  background: #3FD064;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(63,208,100,.22);
}
.cta-text{
  width: 126rpx; height: 38rpx;
  text-align: center;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 400;
  font-size: 28rpx;
  line-height: 38rpx;
  color: #FFFFFF;
}

/* 失败态（可选） */
.card.fail{ border-color:#FFD6D6; }
</style>
