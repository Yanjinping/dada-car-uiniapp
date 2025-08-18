<template>
	<!-- 顶部导航（自定义） -->
	<TitleBar title="实名认证" background="#FFFFFF"  >
	    <!-- 右侧可放占位或图标 -->
	    <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
	  </TitleBar>
  <view class="page">
    <StepperBar :step="3" />

    <view class="title">人脸照片</view>
    <view class="sub">请使用前置摄像头拍摄，保证光线充足、照片清晰</view>

    <!-- 人脸上传组件：与 store 绑定 -->
    <FaceUploader v-model="auth.face" :idCardNumber="auth.idFront.idNumber" :realName="auth.idFront.realName" />

    <view class="label">上传人脸照片</view>

    <view class="tips" v-if="!canSubmit">
      <view class="tips-hd">拍摄须知</view>
      <view>· 请正对前置摄像头</view>
      <view>· 请勿遮挡脸部</view>
      <view>· 请保证光线充足</view>
      <view>· 请确保本人亲自拍摄</view>
    </view>

    <NoticeBar />

    <view class="bottom">
      <button class="primary" type="default" :class="{enabled: canSubmit}" :disabled="!canSubmit" @click="submit">
        {{ canSubmit ? '认证成功，开始用车' : '还差一步就成功了' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import StepperBar from '@/components/auth/StepperBar.vue'
import NoticeBar from '@/components/auth/NoticeBar.vue'
import FaceUploader from '@/components/FaceUploader.vue'
import { useAuthFlow } from '@/stores/useAuthFlow'
	import TitleBar from '@/components/header/TitleBar.vue'
const auth = useAuthFlow()

// 未完成上一步则回到驾驶证页
onShow(() => { if (!auth.canNextFromLicense) uni.reLaunch({ url: '/pages/auth/license' }) })

// 允许提交：要求已核验成功
const canSubmit = computed(() => !!auth.face?.verified && auth.face?.state === 'success')

async function submit(){
  if (!canSubmit.value) return
  try{
    await auth.doSubmit()                     // 你的最终提交流程
    uni.showToast({ title:'认证成功', icon:'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 800)
  }catch(e){
    uni.showToast({ title: e?.message || '认证失败', icon:'none' })
  }
}
</script>

<style scoped>
.page{ padding: 30rpx; background:#fff; }

/* H1 标题：加粗 + 渐变下划线（右移 12rpx） */
.title{
  position: relative;
  width: 210rpx; height: 54rpx;
  margin: 48rpx 0 8rpx;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:600; font-size:40rpx; line-height:54rpx;
  color:#222; text-align:left;
}
.title::after{
  content:''; position:absolute; left:10rpx; bottom:-3rpx;
  width:180rpx; height:16rpx;
  background: linear-gradient(90deg,#8AF1A5 0%, rgba(255,255,255,0) 100%);
}

/* 副文 */
.sub{
  width: 580rpx; height:36rpx; margin:24rpx 0;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight:400; font-size:26rpx; line-height:36rpx;
  color:#AAA; text-align:left;
}

/* 标签与须知 */
.label{
  width:550rpx; margin:12rpx auto 22rpx;
  font-size:28rpx; line-height:38rpx; color:#444; text-align:center;
}
.tips{ width:550rpx; margin:8rpx auto 24rpx; color:#333; line-height:1.9; }
.tips-hd{ font-weight:600; margin-bottom:6rpx; }

/* 底部按钮，与前页保持一致 */
.bottom{ margin-top: 28rpx; display:flex; justify-content:center; }
.primary{
  width:688rpx; height:96rpx; border-radius:48rpx;
  display:flex; align-items:center; justify-content:center;
  font-family:'AlibabaPuHuiTi',sans-serif;
  font-weight:550; font-size:32rpx; line-height:54rpx;
  border:none !important; -webkit-appearance:none; padding:0; overflow:hidden;
  background:#A9E4B2 !important; color:#fff !important;
}
.primary::after{ border:none !important; }
.primary[disabled]{ background:#A9E4B2 !important; color:#fff !important; opacity:1 !important; }
.primary.enabled{ background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%) !important; color:#fff !important; }
</style>
