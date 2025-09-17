<template>
  <movable-area class="float-area" :style="areaStyle">
    <movable-view
      class="float-btn"
      direction="all"
      :x="pos.x"
      :y="pos.y"
      out-of-bounds
      inertia
      @change="onMove"
      @touchend="onRelease"
    >
      <view class="btn" @tap="goMine">
        <image src="/static/icons/wode.png" class="icon" mode="aspectFit" />
        <text class="label">我的</text>
      </view>

      <view v-if="enableLike" class="like" @tap.stop="toggleLike">
        <text class="heart">{{ liked ? '❤️' : '🤍' }}</text>
      </view>
    </movable-view>
  </movable-area>
</template>

<script>
export default {
  name: 'FloatMine',
  props: {
    initX: { type: Number, default: 600 },
    initY: { type: Number, default: 500 },
    adsorb: { type: Boolean, default: true },
    edgeGap: { type: Number, default: 12 },
    enableLike: { type: Boolean, default: false },
    storageKey: { type: String, default: 'FLOAT_MINE_POS' },
  },
  data() {
    return {
      pos: { x: 0, y: 0 },
      sys: uni.getSystemInfoSync(),
      liked: false,
    }
  },
  computed: {
    areaStyle() {
      return `width:${this.sys.windowWidth}px;height:${this.sys.windowHeight}px;`
    },
  },
  mounted() {
    const saved = uni.getStorageSync(this.key('POS'))
    if (saved && typeof saved.x === 'number' && typeof saved.y === 'number') {
      this.pos = saved
    } else {
      this.pos = { x: this.initX, y: this.initY }
    }
    this.liked = !!uni.getStorageSync(this.key('LIKE'))
  },
  methods: {
    key(sfx) { return `${this.storageKey}_${sfx}` },
    goMine() { uni.navigateTo({ url: '/pkg-biz/pages/me/index' }) },
    onMove(e) {
      const { x, y, source } = e.detail || {}
      if (source) this.pos = { x, y }
    },
    onRelease() {
      if (!this.adsorb) return this.savePos()
      const { windowWidth, windowHeight } = this.sys
      const btnW = this.rpx2px(96)
      const btnH = this.rpx2px(96)
      const gap  = this.rpx2px(this.edgeGap)
      const toLeft = this.pos.x + btnW / 2 < windowWidth / 2
      const targetX = toLeft ? gap : windowWidth - btnW - gap
      const minY = gap
      const maxY = windowHeight - btnH - gap
      const targetY = Math.min(Math.max(this.pos.y, minY), maxY)
      this.pos = { x: targetX, y: targetY }
      this.$nextTick(this.savePos)
    },
    savePos() { uni.setStorageSync(this.key('POS'), this.pos) },
    rpx2px(rpx) { return (this.sys.screenWidth / 750) * rpx },
    toggleLike() {
      this.liked = !this.liked
      uni.setStorageSync(this.key('LIKE'), this.liked)
      this.$emit('like', { liked: this.liked })
      try { wx && wx.vibrateShort && wx.vibrateShort({ type: 'light' }) } catch(e) {}
    },
  },
}
</script>

<style scoped>
.float-area { width:100%; height:100%; position:fixed; top:0; left:0; pointer-events:none; z-index:9999; }
.float-btn  { width:96rpx; height:96rpx; pointer-events:auto; }
.btn{
  width:96rpx; height:96rpx; border-radius:50%;
  background:linear-gradient(225deg,#FFDA4C 0%,#FAAE2A 100%);
  display:flex; flex-direction:column; justify-content:center; align-items:center;
  box-shadow:0 8rpx 20rpx rgba(0,0,0,.12);
}
.icon{ width:40rpx; height:40rpx; }
.label{ font-size:22rpx; color:#fff; margin-top:2rpx; }
.like{
  position:absolute; right:-8rpx; top:-8rpx; background:#fff;
  width:36rpx; height:36rpx; border-radius:18rpx;
  box-shadow:0 6rpx 14rpx rgba(0,0,0,.12); display:flex; align-items:center; justify-content:center;
}
.heart{ font-size:24rpx; line-height:1; }
</style>
