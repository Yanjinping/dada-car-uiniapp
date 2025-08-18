<template>
  <view class="card">
    <view class="mid">
      <view class="name ell">{{ data.name }}</view>
      <view v-if="data.carLimitText" class="sub">{{ data.carLimitText }}</view>
      <view class="meta">
        <text class="pill">{{ data.expireText }}</text>
        <text v-if="data.desc" class="rule">{{ data.desc }}</text>
      </view>
    </view>

    <view class="right">
      <text class="price">¥ {{ data.price }}</text>
      <button v-if="data.buyable" class="btn dark" @click="$emit('buy', data.id)">一键购买</button>
      <button v-else class="btn solid" @click="$emit('use', data.id)">立即使用</button>
      <button class="btn ghost" @click="$emit('gift', data.id)">送给好友</button>
    </view>
  </view>
</template>

<script setup>
defineProps({ data:{ type:Object, required:true } })
defineEmits(['buy','use','gift'])
</script>

<style scoped lang="scss">
.card{ display:flex; gap:20rpx; padding:24rpx; background:#FFF; border-radius:24rpx; box-shadow:0 6rpx 18rpx rgba(0,0,0,.04); }
.mid{ flex:1; min-width:0; }
.name{ font-size:32rpx; color:#111; font-weight:600; line-height:44rpx; }
.ell{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.sub{ margin-top:6rpx; font-size:24rpx; color:#6F6F6F; }
.meta{ margin-top:12rpx; display:flex; gap:12rpx; align-items:center; }
.pill{ padding:6rpx 12rpx; font-size:22rpx; color:#D57A1F; background:#FFF1DE; border-radius:10rpx; }
.rule{ font-size:22rpx; color:#8E8E8E; background:#F0F0F0; padding:6rpx 12rpx; border-radius:10rpx; }

.right{ width:240rpx; display:flex; flex-direction:column; align-items:center; gap:14rpx; }
.price{ font-size:44rpx; font-weight:800; color:#FF7009; }
.btn{ width:220rpx; height:80rpx; border-radius:48rpx; font-size:30rpx; }
.solid{ background:linear-gradient(180deg,#FFA23A 0%,#FFCA76 100%); color:#222; font-weight:600; }
.ghost{ background:#FFF; border:2rpx solid #FFA24A; color:#FFA24A; }
.dark{ background:#222; color:#FFF; }
</style>
