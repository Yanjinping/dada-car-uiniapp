<template>
  <view class="popup-mask" v-if="show">
    <view class="popup-container">
      <view class="popup-title">🎉 好友邀请你领取优惠券</view>
      <view class="popup-content">
        <text class="popup-coupon-name">{{ coupon.name }}</text>
        <text class="popup-condition">满 {{ coupon.useCondition }} 元可用</text>
        <text class="popup-expire">有效期至 {{ formatDate(coupon.invalidTime) }}</text>
      </view>
      <view class="popup-actions">
        <button class="btn-cancel" @click="onClose">暂不领取</button>
        <button class="btn-confirm" @click="onConfirm">立即领取</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    show: Boolean,
    coupon: Object
  },
  methods: {
    onClose() {
      this.$emit('update:show', false);
    },
    onConfirm() {
      this.$emit('receive', this.coupon);
      this.onClose();
    },
    formatDate(dateStr) {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
  }
}
</script>

<style scoped>
.popup-mask {
  position: fixed;
  z-index: 999;
  background: rgba(0, 0, 0, 0.5);
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.popup-container {
  width: 80%;
  background: white;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
}
.popup-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
}
.popup-content {
  margin-bottom: 15px;
}
.popup-coupon-name {
  font-size: 18px;
  font-weight: bold;
  color: #FF5722;
}
.popup-condition, .popup-expire {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
  display: block;
}
.popup-actions {
  display: flex;
  justify-content: space-around;
}
.btn-cancel {
  background-color: #ccc;
  border-radius: 20px;
  padding: 8px 20px;
}
.btn-confirm {
  background-color: #FF9800;
  color: white;
  border-radius: 20px;
  padding: 8px 20px;
}
</style>
