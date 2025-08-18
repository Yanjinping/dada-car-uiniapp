<template>
  <view class="share-container">
    <image class="banner" src="/static/coupon_banner.png"></image>
    <view class="content">
      <text class="title">{{ inviterName || '好友' }}邀请你助力领券！</text>
      <text class="coupon-name">{{ coupon.name }}</text>
      <text class="coupon-detail">满 {{ coupon.useCondition }} 元可用</text>
      <button class="btn-receive" @click="showPopup = true">点击领取</button>
    </view>
    <PopupHelpReceive :show.sync="showPopup" :coupon="coupon" @receive="handleReceive" />
  </view>
</template>

<script>
import PopupHelpReceive from '@/components/PopupHelpReceive.vue'
// import { getCouponById, receiveHelpCoupon } from '@/api/coupon'

export default {
  components: { PopupHelpReceive },
  data() {
    return {
      inviterName: '',
      coupon: {},
      showPopup: false
    }
  },
  async onLoad(options) {
    const { couponId, inviter } = options;
    this.inviterName = decodeURIComponent(inviter || '好友');
    const res = await getCouponById({ couponId });
    if (res.code === 0) this.coupon = res.data;
  },
  methods: {
    async handleReceive(coupon) {
      const userId = uni.getStorageSync('userId') || 0;
      const res = await receiveHelpCoupon({ couponId: coupon.couponId, userId });
      if (res.code === 0) {
        uni.showToast({ title: '领取成功', icon: 'success' });
        uni.switchTab({ url: '/pages/coupon/index' });
      } else {
        uni.showToast({ title: res.message || '领取失败', icon: 'none' });
      }
    }
  }
}
</script>

<style scoped>
.share-container {
  text-align: center;
  padding-top: 20px;
}
.banner {
  width: 100%;
  height: 200px;
}
.content {
  margin-top: 20px;
}
.title {
  font-size: 20px;
  font-weight: bold;
}
.coupon-name {
  font-size: 22px;
  color: #FF5722;
  margin-top: 10px;
}
.coupon-detail {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}
.btn-receive {
  margin-top: 20px;
  background-color: #FF9800;
  color: white;
  border-radius: 25px;
  padding: 10px 30px;
}
</style>
