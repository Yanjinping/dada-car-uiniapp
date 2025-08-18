<template>
  <uni-popup ref="popup" type="center">
    <view class="rule-dialog">
      <view class="title">用车规则</view>
      <scroll-view class="rules" scroll-y>
        <view v-for="(rule, index) in rules" :key="index" class="rule-item">
          <text class="rule-index">{{ index + 1 }}.</text>
          <text class="rule-text">{{ rule }}</text>
        </view>
      </scroll-view>
      <button class="confirm-btn" @click="handleConfirm">{{ confirmText }}</button>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, defineExpose, defineProps, defineEmits } from 'vue'
import uniPopup from '@dcloudio/uni-ui/lib/uni-popup/uni-popup.vue'
import uniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue' // 必须引入！

const popup = ref(null)

const props = defineProps({
  rules: {
    type: Array,
    default: () => [
      '取车拍照保障权益',
      '车内禁烟保持整洁',
      '禁止驶入地下室',
      '按规停放画线车位',
      '还车电量≥50%',
      '驾龄影响赔付比例'
    ]
  },
  confirmText: {
    type: String,
    default: '确认用车'
  }
})

const emit = defineEmits(['confirm'])

function open() {
  popup.value?.open?.()
}

function close() {
  popup.value?.close?.()
}

function handleConfirm() {
  emit('confirm')
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
.rule-dialog {
  width: 80vw;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 15px;
}

.rules {
  max-height: 50vh;
  margin-bottom: 15px;
}

.rule-item {
  display: flex;
  margin-bottom: 10px;
  line-height: 1.5;
}

.confirm-btn {
  background: #07C160;
  color: white;
  border-radius: 20px;
}
</style>
