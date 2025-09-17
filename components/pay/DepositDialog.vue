<template>
  <view v-if="show" class="mask">
    <view class="panel" @tap.stop>
      <!-- 背景渐变 + 模糊椭圆 -->
      <view class="bg-gradient"/>
      <view class="blob blob-1"/>
      <view class="blob blob-2"/>
	  
	  <view class="fx-bg" pointer-events="none">
	    <view class="ellipse g1"></view>
	    <view class="ellipse g2"></view>
	  </view>

      <!-- 右上角吉祥物（按需替换图片） -->
      <image v-if="icon" class="mascot" :src="icon" mode="aspectFit" />

      <!-- 标题（如需隐藏可传空） -->
      <view v-if="title" class="title">{{ title }}</view>

      <!-- 描述文案 -->
      <view class="desc">
        {{ desc || '请缴纳押金以免影响使用，分时押金和芝麻免押只需满足一项即可用车。' }}
      </view>

      <!-- 分时押金按钮 -->
      <view class="btn btn-deposit" @tap="emit('pay')">
        <text class="btn-main">分时押金:{{ formatMoney(depositAmount) }}</text>
        <view class="btn-right">
          <text class="btn-cta">去缴纳</text>
          <i class="arrow"></i>
        </view>
      </view>

      <!-- 芝麻免押按钮 -->
      <view class="btn btn-zhima" @tap="emit('authorize')">
        <view class="zhima-left">
          <text class="btn-main">芝麻免押</text>
          <text class="btn-sub">（{{ zhimaThreshold }}分以上）</text>
        </view>
        <view class="btn-right">
          <text class="btn-cta">去授权</text>
          <i class="arrow"></i>
        </view>
      </view>

      <!-- 以后 -->
      <view class="later" @tap="onLater">以后</view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },              // v-model:show
  title: { type: String, default: '缴纳押金' },
  desc: { type: String, default: '' },
  depositAmount: { type: [Number, String], default: 800 },
  zhimaThreshold: { type: [Number, String], default: 650 },
  icon: { type: String, default: '' }                   // e.g. '/static/mascot.png'
})
const emit = defineEmits(['update:show','pay','authorize','later'])

function onLater(){
  emit('later')
  emit('update:show', false)
}
function formatMoney(v){
  const n = Number(v || 0)
  return n % 1 === 0 ? `${n}元` : `${n.toFixed(2)}元`
}
</script>

<style scoped>
/* —— 外层遮罩 —— */
.mask{
  position: fixed; inset: 0;
  background: rgba(0,0,0,.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
}

/* —— 弹窗主体（按规范：650rpx * 670rpx，圆角32rpx） —— */
.panel{
  position: relative;
  width: 650rpx;
  height: 670rpx;
  border-radius: 32rpx;
  overflow: hidden;
}

/* 背景渐变（按规范：#FFECDD -> #FFFFFF, 180deg） */
.bg-gradient{
  position: absolute; inset: 0;
  background: linear-gradient(180deg, #FFECDD 0%, #FFFFFF 100%);
}

/* 两个高斯模糊椭圆（blur 100px；不同平台如不支持 filter，请视情况替换为 PNG） */
.blob{
  position: absolute;
  border-radius: 9999rpx;
  filter: blur(100px);
}
.blob-1{
  left: 0; bottom: 220rpx;
  width: 278rpx; height: 142rpx;
  background: #E5FDB6;
}
.blob-2{
  left: 145rpx; bottom: 220rpx;
  width: 342rpx; height: 136rpx;
  background: #90E5A5;
}

/* 容器：紧贴面板顶部一段高度即可（不影响下面按钮） */
.fx-bg{
  position:absolute; left:0; top:0; right:0; height:230rpx;
  overflow:visible; pointer-events:none;
}

/* 通用椭圆 */
.ellipse{
  position:absolute; border-radius:9999rpx;
  filter: blur(100rpx);             /* ≈ 高斯模糊 200rpx 视觉 */
}

/* 椭圆1：#E5FDB6  278×142 */
.g1{
  width:278rpx; height:142rpx;
  left:0; top:0;
  background:#E5FDB6;
}

/* 椭圆2（你问的这一块）：#90E5A5  342×136  左移 ~195rpx */
.g2{
  width:342rpx; height:136rpx;
  left:195rpx; top:0;
  background:#90E5A5;               /* 就是这块的底色 */
}



/* 吉祥物（按你给的 124*140rpx 视觉，贴右上） */
.mascot{
  position: absolute;
  right: 40rpx; top: 24rpx;
  width: 124rpx; height: 140rpx;
}

/* 标题（可选） */
.title{
  position: absolute;
  top: 50rpx;
  left: 0;
  right: 0;
  text-align: center;          /* 居中 */
  font-size: 40rpx;
  font-weight: 700;
  color: #222229;
  padding: 0 140rpx;           /* 预留右上角吉祥物的空间，防止遮挡 */
}

/* 描述（按规范：宽550，高96，字号32，行高48，左对齐） */
.desc{
  position: absolute;
  left: 50rpx; top: 176rpx;
  width: 520rpx; height: 96rpx;
  font-family: AlibabaPuHuiTi, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei';
  font-weight: 550;
  font-size: 30rpx;
  line-height: 48rpx;
  color: #222229;
  text-align: left;
}

/* 通用按钮（按规范：宽550，高96，圆角48） */
.btn{
  position: absolute;
  left: 50rpx;
  width: 550rpx; height: 96rpx;
  border-radius: 48rpx;
  padding: 0 36rpx;
  box-sizing: border-box;
  display: flex; align-items: center; justify-content: space-between;
  overflow: hidden;
}
.btn-deposit{ top: 316rpx; background: #1BBD43; color: #fff; }
.btn-zhima{   top: 440rpx; background: #0FA3FF; color: #fff; }

.btn-main{
  font-family: AlibabaPuHuiTi, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei';
  font-weight: 500;
  font-size: 32rpx;
  line-height: 50rpx;
  color: #FFFFFF;
}
.btn-sub{
  margin-left: 8rpx;
  font-size: 26rpx;
  line-height: 50rpx;
  color: #FFFFFF;
}
.zhima-left{ display: flex; align-items: center; }

.btn-right{ display: flex; align-items: center; gap: 10rpx; }
.btn-cta{
  font-family: AlibabaPuHuiTi, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei';
  font-weight: 400;
  font-size: 31rpx;
  line-height: 44rpx;
  color: #FFFFFF;
}

/* 右侧小箭头（按规范：8*16，2rpx白色描边） */
.arrow{
  display: inline-block;
  width: 12rpx; height: 12rpx;
  border-right: 2rpx solid #FFFFFF;
  border-bottom: 2rpx solid #FFFFFF;
  transform: rotate(-45deg);
  margin-top: 2rpx;
}

/* 以后（按规范：字号32，#888888，居中） */
.later{
  position: absolute;
  left: 0; right: 0; bottom: 44rpx;
  width: 64rpx; height: 44rpx;
  margin: 0 auto;
  text-align: center; line-height: 44rpx;
  font-family: AlibabaPuHuiTi, system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei';
  font-weight: 500; font-size: 32rpx; color: #888888;
}
</style>
