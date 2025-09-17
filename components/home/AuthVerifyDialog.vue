<template>
  <view v-if="modelValue" class="mask" @click="onMask">
    <!-- 阻断冒泡，避免点内容区关闭 -->
    <view class="sheet" @click.stop>
      <!-- 拖拽提示条 -->
      <view class="drag-bar"></view>

      <!-- 关闭 -->
      <text v-if="closeable" class="close" @click="onClose">×</text>

      <!-- 标题 -->
      <view class="title">{{ title }}</view>

      <!-- 描述 -->
      <view class="desc">
        <text>{{ desc }}</text>
      </view>

      <!-- 法规提示 -->
      <view class="tip">
        <svg class="tip-ico" viewBox="0 0 24 24">
          <path d="M12 2l9 9-9 9-9-9 9-9zm-1 6h2v2h-2V8zm0 4h2v6h-2v-6z"/>
        </svg>
        <text class="tip-text">{{ tip }}</text>
      </view>

      <!-- 主按钮（渐变 + 奖励角标） -->
      <view class="btn-primary" @click="onConfirm">
        <text>{{ confirmText }}</text>
        <view v-if="rewardText" class="badge">{{ rewardText }}</view>
      </view>

      <!-- 次按钮 -->
      <view v-if="showCancel" class="btn-secondary" @click="onCancel">
        <text>{{ cancelText }}</text>
      </view>

      <!-- 底部安全区 -->
      <view class="safe-bottom" />
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },   // v-model 控制显隐
  closeable: { type: Boolean, default: true },
  title: { type: String, default: '实名认证' },
  desc: {
    type: String,
    default: '请上传您本人的身份证、驾驶证，并尽快完成实名认证信息'
  },
  tip: {
    type: String,
    default: '根据国家法律法规要求，需要上传有效的实名认证信息，避免影响后续使用'
  },
  confirmText: { type: String, default: '立即认证' },
  cancelText: { type: String, default: '以后再说' },
  rewardText: { type: String, default: '可获得10元立减券' },
  showCancel: { type: Boolean, default: true },
  closeOnMask: { type: Boolean, default: true }    // 点蒙层关闭
})

const emits = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

function hide () { emits('update:modelValue', false) }
function onClose () { hide(); emits('close') }
function onCancel () { hide(); emits('cancel') }
function onConfirm () { emits('confirm') } // 交由外层跳转后再隐藏更顺滑
function onMask () { if (props.closeOnMask) onClose() }
</script>

<style scoped>
/* ------- 蒙层 ------- */
.mask{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 9999;
  /* 禁止蒙层滑动穿透 */
  touch-action: none;
}

/* ------- 底部抽屉 ------- */
.sheet{
  position: absolute; left: 0; right: 0; bottom: 0;
  background: linear-gradient(180deg,#F0FFF6 0%, #FFFFFF 100%);
  border-top-left-radius: 28rpx; border-top-right-radius: 28rpx;
  box-shadow: 0 -12rpx 36rpx rgba(0,0,0,.16);
  padding: 16rpx 28rpx 28rpx;
  animation: slideUp .18s ease-out both;
}

/* 顶部小横条 */
.drag-bar{
  width: 110rpx; height: 10rpx; border-radius: 10rpx;
  background: #E5E7EB;
  margin: 8rpx auto 12rpx;
}

/* 右上关闭 */
.close{
  position: absolute; right: 20rpx; top: 14rpx;
  width: 44rpx; height: 44rpx; line-height: 44rpx; text-align: center;
  font-size: 36rpx; color: #9AA0A6;
}

/* 标题、描述 */
.title{
  margin-top: 8rpx;
  text-align: center; font-weight: 700; font-size: 34rpx; color: #1F1F1F;
}
.desc{
  margin-top: 12rpx; font-size: 28rpx; line-height: 44rpx; color: #1E1E1E;
}

/* 提示块 */
.tip{
  margin-top: 12rpx; padding: 12rpx 14rpx; display: flex; gap: 8rpx;
  background: #F4FBF7; border-radius: 16rpx; align-items: flex-start;
}
.tip-ico{ width: 28rpx; height: 28rpx; fill: #19C27C; flex: 0 0 28rpx; margin-top: 4rpx; }
.tip-text{ font-size: 24rpx; line-height: 34rpx; color: #6B7280; }

/* 主按钮 */
.btn-primary{
  margin-top: 22rpx;
  height: 96rpx; border-radius: 48rpx;
  background: linear-gradient(180deg,#7DEB70 0%, #12B64A 100%);
  color: #fff; font-size: 32rpx; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  box-shadow: 0 12rpx 24rpx rgba(18,182,74,.28);
}

/* 奖励角标 */
.badge{
  position: absolute; right: 16rpx; top: -16rpx;
  padding: 8rpx 14rpx; font-size: 22rpx; color: #fff;
  background: linear-gradient(180deg,#FFA44D 0%, #FF7A00 100%);
  border-radius: 24rpx; box-shadow: 0 8rpx 16rpx rgba(255,122,0,.25);
  white-space: nowrap;
}

/* 次按钮 */
.btn-secondary{
  margin-top: 14rpx;
  height: 92rpx; border-radius: 46rpx;
  border: 2rpx solid #E5E7EB; color:#6B7280;
  display:flex; align-items:center; justify-content:center;
  background: #FFFFFF; font-size: 30rpx; font-weight: 600;
}

/* 底部安全区占位（H5/小程序都有效） */
.safe-bottom{
  height: constant(safe-area-inset-bottom);
  height: env(safe-area-inset-bottom);
}

/* 动画 */
@keyframes slideUp{
  from { transform: translateY(12%); opacity: .0; }
  to   { transform: translateY(0);    opacity: 1; }
}
</style>
