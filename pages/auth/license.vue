<template>
	<!-- 顶部导航（自定义） -->
	<TitleBar title="实名认证" background="#FFFFFF"  >
	    <!-- 右侧可放占位或图标 -->
	    <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
	  </TitleBar>
  <view class="page">
    <StepperBar :step="2" />

    <view class="title">驾驶证信息</view>
    <view class="sub">请保证证件完整、字体清晰、亮度均匀</view>

    <!-- 驾驶证上传：与卡片同宽 550rpx 居中 -->
    <OcrDrivingUploader v-model="auth.license" />

    <view class="label">上传机动车驾驶证</view>

    <NoticeBar />

    <!-- 底部按钮 -->
    <view class="bottom">
      <button
        class="primary"
        type="default"
        :class="{ enabled: canNext }"
        :disabled="!canNext"
        @click="goNext"
      >
        下一步
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import StepperBar from '@/components/auth/StepperBar.vue'
import NoticeBar from '@/components/auth/NoticeBar.vue'
import OcrDrivingUploader from '@/components/OcrDrivingUploader.vue'
import { useAuthFlow } from '@/stores/useAuthFlow'
	import TitleBar from '@/components/header/TitleBar.vue'
const auth = useAuthFlow()

// 若未完成上一步，重定向
onShow(() => {
  if (!auth.canNextFromId) {
    uni.reLaunch({ url: '/pages/auth/idcard' })
  }
})

// 是否可进入下一步：准驾车型 + 证号 两者都有且识别成功
const canNext = computed(() =>
  !!(auth.license?.drivingType && auth.license?.idNumber && auth.license?.state === 'success')
)

function goNext () {
  if (!canNext.value) return
  auth.step = 3
  uni.navigateTo({ url: '/pages/auth/face' })
}
</script>

<style scoped>
.page { padding: 30rpx; background: #FFFFFF; }

/* H1 标题：加粗黑色 + 渐变下划线（右移 12rpx） */
.title{
  position: relative;
  width: 210rpx;
  height: 54rpx;
  margin: 48rpx 0 8rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 600;
  font-size: 40rpx;
  line-height: 54rpx;
  color: #222222;
  text-align: left;
}
.title::after{
  content: '';
  position: absolute;
  left: 10rpx;              /* ← 与蓝湖一致的右移 */
  bottom: -3rpx;
  width: 180rpx;
  height: 16rpx;
  background: linear-gradient(90deg, #8AF1A5 0%, rgba(255,255,255,0) 100%);
}

/* 副文 */
.sub{
  width: 450rpx;
  height: 36rpx;
  margin: 24rpx 0 24rpx;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 26rpx;
  line-height: 36rpx;
  color: #AAAAAA;
  text-align: left;
}

/* 分段小标题：与卡片同宽、居中 */
.label{
  width: 550rpx;
  margin: 12rpx auto 28rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 400;
  font-size: 28rpx;
  line-height: 38rpx;
  color: #444444;
  text-align: center;
}

/* 底部按钮容器 */
.bottom{ margin-top: 28rpx; display: flex; justify-content: center; }

/* 按钮：禁用为浅绿底+白字，启用为竖向渐变绿 */
.primary{
  width: 688rpx;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex; align-items: center; justify-content: center;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 550;
  font-size: 40rpx;
  line-height: 54rpx;
  border: none !important;
  -webkit-appearance: none;
  padding: 0; overflow: hidden;
  background: #A9E4B2 !important;    /* 禁用色（更接近蓝湖） */
  color: #FFFFFF !important;
}
.primary::after{ border: none !important; }
.primary[disabled]{
  background: #A9E4B2 !important;
  color: #FFFFFF !important;
  opacity: 1 !important;
}
.primary.enabled{
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%) !important;
  color: #FFFFFF !important;
}

/* 兼容旧组件类（无需时可删） */
.next{ height:100rpx; border-radius:60rpx; background:#cfeecd; color:#fff; }
.next.on{ background: linear-gradient(90deg,#27c24c,#2ecc71); }

/* 老版占位：如果页面还有 .upload-box/.overlay 的子组件 */
:deep(.upload-box){ border:2rpx dashed #E0E0E0; }
:deep(.overlay){ height:96rpx; }
</style>
