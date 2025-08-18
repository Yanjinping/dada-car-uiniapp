<template>
  <view class="wrap">
	<view class="row1" @tap="innerExpanded = !innerExpanded">
      <image class="ico" :src="icon" />
      <text class="title">{{ title }}</text>
      <text class="arrow">{{ innerExpanded ? '▾' : '▸' }}</text>
    </view>

      <view v-show="innerExpanded" class="grid">
      <view v-for="(a,i) in amounts" :key="i" class="cell">
        <view class="val">{{ a.value }}</view>
        <view class="lab">{{ a.label }}<text v-if="a.sub" class="sub">{{ a.sub }}</text></view>
      </view>

      <view class="btns">
        <button class="btn outline" @tap="$emit('tap-leftBtn')">{{ leftBtn?.text || '提现' }}</button>
        <button class="btn dark" @tap="$emit('tap-rightBtn')">{{ rightBtn?.text || '充值' }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: String, title: String,
  expandable: Boolean,
  expanded: Boolean,         // ← v-model:expanded 对应
  amounts: Array,
  leftBtn: Object,
  rightBtn: Object
})
const emit = defineEmits(['update:expanded','tap-leftBtn','tap-rightBtn'])

// 关键：内部双向绑定代理
const innerExpanded = computed({
  get: () => !!props.expanded,
  set: (v) => emit('update:expanded', v)
})
</script>

<style scoped>
.wrap{
  margin: 8rpx 0;
  background:#FFF4E8;
  border-radius: 20rpx;       /* 原 24rpx */
  padding: 16rpx;             /* 原 24rpx */
}
.row1{
  height: 56rpx;              /* 新增行高限制，更紧凑 */
  display:flex; align-items:center; gap: 10rpx;
}
.ico{ width: 40rpx; height: 40rpx; }
.title{ font-weight:600; color:#7a5b3a; }
.arrow{ margin-left:auto; color:#9a7d58; }

.grid{ margin-top: 12rpx; }
.cell{ margin: 8rpx 0; }
.val{ font-size: 34rpx; font-weight: 700; color:#4a4036; }  /* 原 36rpx */
.lab{ font-size: 22rpx; color:#7a5b3a; }
.sub{ color:#b79b7a; margin-left: 6rpx; }

.btns{ display:flex; gap: 14rpx; margin-top: 12rpx; }
.btn{
  flex:1; height: 68rpx;      /* 原 72rpx */
  border-radius: 16rpx;       /* 原 18rpx */
  display:flex; align-items:center; justify-content:center;
}
.outline{
  background:#fff; border: 2rpx solid #C7A574; color:#7a5b3a;
}
.dark{
  background:#222; color:#F6D08A;
}
</style>

