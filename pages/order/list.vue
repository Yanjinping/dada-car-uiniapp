<template>
  <view class="page">
	
    <!-- 顶部 -->
    <view class="header">
		<!-- 顶部导航（自定义） -->
		<TitleBar title="嗒嗒钱包" background="transparent">
		    <!-- 右侧可放占位或图标 -->
		    <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
		  </TitleBar>
  

      <!-- 顶部 Tab -->
      <view class="tabs">
        <text
          class="tab tab-finished"
          :class="tab===0 ? 'active' : 'inactive'"
          @click="switchTab(0)"
        >已完成</text>

        <text
          class="tab tab-progress"
          :class="tab===1 ? 'active' : 'inactive'"
          @click="switchTab(1)"
        >进行中</text>

        <!-- 激活下划线：跟随激活 Tab，并带轻微上下动效 -->
        <image
          class="yuanhu-img"
          :class="{'bounceY': bouncing}"
          :style="{ left: underlineLeft, top: '252rpx' }"
          src="/static/icons/yuanhu.png"
          mode="widthFix"
        />
      </view>
    </view>

    <!-- 与内容的间距（加大） -->
    <view class="header-spacer" />

    <!-- 温馨提示（仅已完成） -->
    <view v-if="tab===0" class="tip-card">
      <text class="tip-title">温馨 提示</text>
      <view class="tip-right">
        <text class="tip-text">违章查询结果将于15-20个工作日后公布</text>
        <text class="tip-sub">注： 工作日每周1-周5</text>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view scroll-y class="list-wrap">
      <view v-for="(item, idx) in renderList" :key="idx" class="card" @click="goDetail(item)">
        <view class="row row-bordered">
          <text class="label label-orderno">订单编号</text>
          <text class="value value-orderno ellipsis">{{ item.orderNum }}</text>
        </view>

        <view class="row">
          <text class="label label-plate">车牌号码</text>
          <text class="value value-plate">{{ item.plateNum }}</text>
        </view>

        <view v-if="tab===0" class="row">
          <text class="label label-violate">是否违章</text>
          <text class="value value-violate" :class="{'orange': item.violationStatus==='查询中 >','green': item.violationStatus==='无违章'}">
            {{ item.violationStatus }}
          </text>
        </view>

        <view class="row">
          <text class="label label-usetm">{{ tab===0 ? '用车时间' : '取车时间' }}</text>
          <text class="value value-usetm">{{ tab===0 ? item.useTime : item.takeTime }}</text>
        </view>

        <view class="row">
          <text class="label label-net">取车网点</text>
          <text class="value value-net">{{ item.takeNet }}</text>
        </view>
      </view>

      <view v-if="renderList.length===0" class="empty">暂无订单</view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'

const tab = ref(0)
const bouncing = ref(false)

/** yuanhu 居中到激活文字（宽 44rpx） */
const underlineWidth = 44
const finishedLeft = 40, finishedWidth = 126
const progressLeft = 226, progressWidth = 114
const underlineLeft = computed(() => {
  const L = tab.value === 0 ? finishedLeft : progressLeft
  const W = tab.value === 0 ? finishedWidth : progressWidth
  return (L + (W - underlineWidth) / 2) + 'rpx'
})

/** 切换：触发轻微上下浮动动效 */
const switchTab = (i) => {
  if (tab.value === i) return
  tab.value = i
  bouncing.value = false
  setTimeout(()=> (bouncing.value = true), 0)
  setTimeout(()=> (bouncing.value = false), 260)
}

const goBack = ()=> uni.navigateBack()
const goDetail = (item)=> uni.navigateTo({ url:'/pages/order/detail' })

/** mock 数据（上线替换接口即可） */
const listFinished = ref([
  { orderNum:'018841620250729120856968', plateNum:'闽C·D12345', violationStatus:'查询中 >',
    useTime:'2025-07-29 12:09至2025-07-29 12:25', takeNet:'丰泽区丨坪山加油站(勿停充电桩)' },
  { orderNum:'018841620250729120856968', plateNum:'闽C·D12345', violationStatus:'无违章',
    useTime:'2025-07-29 12:09至2025-07-29 12:25', takeNet:'丰泽区丨坪山加油站(勿停充电桩)' }
])
const listProgress = ref([
  { orderNum:'018841620250729120856968', plateNum:'闽C·D12345',
    takeTime:'2025-07-29 12:09', takeNet:'丰泽区丨坪山加油站(勿停充电桩)' }
])

const renderList = computed(() => tab.value===0 ? listFinished.value : listProgress.value)
</script>

<style scoped>
.page{background:#F7F8FA;min-height:100vh}

/* 顶部 */
.header{
  height:260rpx;
  background:linear-gradient(180deg,#6BE387 0%,#44D477 100%);
  position:relative;
}
/* 对齐：左 16rpx，标题绝对居中（不受左右按钮影响） */
.nav{
  height:88rpx;padding:0 16rpx;display:flex;align-items:center;justify-content:space-between;color:#FFF;position:relative
}
.back{font-size:48rpx}
.nav-title{position:absolute;left:50%;transform:translateX(-50%);font-size:34rpx}
.nav-right{display:flex;gap:16rpx;font-size:32rpx}

/* Tabs：沉降 + 变暗的态 */
.tabs{position:absolute;left:0;top:0;width:750rpx;height:260rpx}
.tab{
  position:absolute;color:#FFF;letter-spacing:1px;text-align:left;
  transition: color .2s ease, opacity .2s ease, transform .2s ease;
}
.tab-finished{left:40rpx;top:198rpx;width:126rpx;height:48rpx;line-height:48rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-weight:500;font-size:40rpx}
.tab-progress{left:226rpx;top:200rpx;width:114rpx;height:44rpx;line-height:43rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-weight:400;font-size:36rpx}
.tab.active{opacity:1;transform:translateY(0)}
.tab.inactive{opacity:.65;transform:translateY(8rpx)}  /* 非激活沉下去并变暗 */

/* yuanhu 下划线：左右过渡 + 轻微上下动效 */
.yuanhu-img{
  position:absolute;width:44rpx;height:6rpx;border-radius:8rpx;
  transition:left .22s ease, transform .24s ease; 
}
.bounceY{ transform: translateY(6rpx); }

/* Tabs 与下方间距（加大） */
.header-spacer{height:28rpx }

/* 温馨提示（左右 20rpx） */
.tip-card{margin:0 20rpx 0; padding:24rpx; background:#FFFFFF;border-radius:16rpx;display:flex;gap:20rpx;align-items:flex-start}
.tip-title{width:68rpx;height:64rpx;font-family:YouSheBiaoTiHei,YouSheBiaoTiHei;font-size:36rpx;color:#1BBD43;line-height:32rpx}
.tip-right{flex:1}
.tip-text{display:block;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-size:28rpx;color:#444;line-height:36rpx}
.tip-sub{display:block;margin-top:4rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-size:28rpx;color:#444;line-height:36rpx}

/* 列表 */
.list-wrap{padding-bottom:40rpx}
.card{margin:20rpx 20rpx 0;background:#FFFFFF;border-radius:32rpx;padding:20rpx 24rpx}

/* 行与排版 */
.row{display:flex;align-items:center;justify-content:space-between;margin-top:18rpx}
.row:first-child{margin-top:0}
.row-bordered{padding-bottom:16rpx;border-bottom:1rpx solid #EFEFEF}

.label{width:142rpx;text-align:left;color:#222;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-weight:400}
.label-orderno{font-size:32rpx;line-height:38.4rpx;height:42rpx;font-weight:500;color:#222}

.value{text-align:right;margin-left:10rpx;word-break:break-all;white-space:normal}
.value-orderno{width:430rpx;max-width:430rpx;height:40rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-weight:500;font-size:28rpx;color:#666;line-height:33.6rpx}
.label-plate,.label-violate,.label-usetm,.label-net{font-size:30rpx;line-height:36rpx;height:42rpx}
.value-plate{width:300rpx;max-width:300rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-weight:500;font-size:30rpx;color:#444;line-height:40rpx}
.value-violate{width:300rpx;max-width:300rpx;font-size:30rpx;line-height:40rpx}
.value-usetm{width:520rpx;max-width:520rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-size:28rpx;color:#888;line-height:40rpx}
.value-net{width:618rpx;max-width:618rpx;font-family:AlibabaPuHuiTi,AlibabaPuHuiTi;font-size:28rpx;color:#888;line-height:40rpx}

/* 状态色 */
.orange{color:#FF7009}.green{color:#1BBD43}

/* 省略/空态 */
.ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.empty{padding:80rpx 0;color:#999;text-align:center}
</style>
