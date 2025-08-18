<template>
	<!-- 顶部导航（自定义） -->
	<TitleBar title="实名认证" background="#FFFFFF"  >
	    <!-- 右侧可放占位或图标 -->
	    <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
	  </TitleBar>
  <view class="page">
    <StepperBar :step="1" />

    <view class="title">身份证信息</view>
    <view class="sub">请保证证件完整、字体清晰，亮度均匀</view>

    <!-- 正面 -->
    <OcrUploader
      type="front"
      :state="auth.idFront.state"
      :modelValue="auth.idFront"
      @update:modelValue="onFrontUpdate"
    />
    <view class="label">上传身份证人相面</view>

    <!-- 反面 -->
    <OcrUploader
      type="back"
      :state="auth.idBack.state"
      :modelValue="auth.idBack"
      @update:modelValue="onBackUpdate"
    />
    <view class="label">上传身份证国徽面</view>

    <NoticeBar />

    <view class="bottom">
      <button class="primary"  type="default" :class="{enabled: canNext}" :disabled="!canNext" @click="goNext">
        下一步
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import StepperBar from '@/components/auth/StepperBar.vue'
import NoticeBar from '@/components/auth/NoticeBar.vue'
import OcrUploader from '@/components/OcrUploader.vue'
import { useAuthFlow } from '@/stores/useAuthFlow'
	import TitleBar from '@/components/header/TitleBar.vue'

const auth = useAuthFlow()
const canNext = computed(() => auth.canNextFromId)

const onFrontUpdate = (data) => {
  auth.idFront.imageUrl = data.imageUrl || ''
  auth.idFront.realName = data.realName || ''
  auth.idFront.idNumber = data.idNumber || ''
  auth.idFront.sex      = data.sex || ''
  auth.idFront.birth    = data.birth || ''
  auth.idFront.address  = data.address || ''
  auth.idFront.state    = (auth.idFront.realName && auth.idFront.idNumber) ? 'success' : 'fail'
}
const onBackUpdate = (data) => {
  auth.idBack.imageUrl  = data.imageUrl || ''
  auth.idBack.issueOrg  = data.issueOrg || ''
  auth.idBack.validDate = data.validDate || ''
  auth.idBack.state     = (auth.idBack.issueOrg || auth.idBack.validDate) ? 'success' : 'fail'
}
const goNext = () => {
  if (!canNext.value) return
  auth.step = 2
  uni.navigateTo({ url: '/pages/auth/license' })
}
</script>

<style scoped>
.page{padding:30rpx;background: #FFFFFF;}

/* H1：40rpx/500/#222 */
/* H1 标题：加粗黑色 + 渐变下划线 */
.title {
  position: relative; /* 为下划线定位做准备 */
  width: 210rpx;
  height: 54rpx;
  margin: 48rpx 0 8rpx;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 600; /* 加粗 */
  font-size: 40rpx;
  line-height: 54rpx;
  color: #222222;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

/* 下划线：绿色渐变 → 透明 */
.title::after {
  content: '';
  position: absolute;
  left:10rpx;          /* ← 关键：往右偏移一点 */
  bottom: -3rpx; /* 控制下划线距离文字底部的距离 */
  width: 180rpx; /* 按蓝湖标注 */
  height: 16rpx;
  background: linear-gradient(90deg, #8AF1A5 0%, rgba(255,255,255,0) 100%);
}


/* 副文：26rpx/#AAA */
.sub{
  width:450rpx;height:36rpx;margin-bottom:24rpx; margin-top: 24rpx;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight:400;font-size:26rpx;line-height:36rpx;color:#AAA;text-align:left;
}

/* 分段小标题 */
.label{
  margin:12rpx auto 28rpx; 
  width:550rpx;  
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight:400;font-size:28rpx;line-height:38rpx;color:#444444;
  text-align:center;

}

/* 外层容器，按钮居中 */
.bottom {
  margin-top: 28rpx;
  display: flex;
  justify-content: center;
}

.primary {
  width: 688rpx;
  height: 96rpx;
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 550; /* 更粗一点 */
  font-size: 40rpx;
  line-height: 54rpx;
  border: none !important;
  -webkit-appearance: none;
  overflow: hidden;
  padding: 0;
  /* 背景颜色更接近蓝湖：饱和浅绿 */
  background: #A9E4B2 !important; 
  color: #FFFFFF !important;
}
.primary::after { border: none !important; }
.primary[disabled] {
  background: #A9E4B2 !important; /* 禁用也保持这个色 */
  color: #FFFFFF !important;
  opacity: 1 !important;
}
.primary.enabled {
  background: linear-gradient(180deg, #82ED71 0%, #0DB63D 100%) !important;
  color: #FFFFFF !important;
}


/* 上传卡片内部覆层高度统一到 96rpx（和设计一致）——组件已适配 */
:deep(.upload-box){ border:2rpx dashed #E0E0E0; }
:deep(.overlay){ height:96rpx; }
</style>
