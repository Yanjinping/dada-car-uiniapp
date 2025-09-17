<template>
  <view class="page">

    <!-- 绿色背景承接区（与标题栏同渐变），容纳状态块 -->
    <view class="hero">
		<!-- 顶部导航（自定义） -->
		<TitleBar title="嗒嗒钱包" background="transparent">
		    <!-- 右侧可放占位或图标 -->
		    <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
		  </TitleBar>
      <view class="state">
        <view class="ok-ico">✔</view>
        <view class="state-text">
          <view class="t1">订单已完成</view>
          <view class="t2">嗒嗒一下，快乐自驾！</view>
        </view>
        <view class="service" @click="contactService">
          <image class="avatar" :src="serviceAvatar" mode="aspectFill" />
          <text class="svc-text">联系客服</text>
        </view>
      </view>
    </view>

    <!-- 主体内容 -->
    <scroll-view scroll-y class="content">

      <!-- 费用合计 -->
      <view class="card fee">
        <view class="fee-total">¥{{ money(order.totalAmount) }}</view>

        <view class="row"><text class="label">时长费</text><text class="val">¥{{ money(order.fee.time) }}</text></view>
        <view class="row"><text class="label">里程费</text><text class="val">¥{{ money(order.fee.mileage) }}</text></view>
        <view class="row"><text class="label">不计免赔</text><text class="val">¥{{ money(order.fee.insurance) }}</text></view>
        <view class="row"><text class="label">调度费</text><text class="val">¥{{ money(order.fee.dispatch) }}</text></view>
        <view class="row"><text class="label">整备服务费</text><text class="val">¥{{ money(order.fee.service) }}</text></view>
        <view class="row">
          <text class="label">电池损耗费 <text class="info">i</text></text>
          <text class="val">¥{{ money(order.fee.battery) }}</text>
        </view>

        <view class="row"><text class="label strong">使用套餐</text><text class="val gray">{{ order.packageUsed || '未使用' }}</text></view>
        <view class="row"><text class="label strong">优惠券抵扣</text><text class="val gray">{{ order.couponDiscount>0 ? ('-¥'+money(order.couponDiscount)) : '0' }}</text></view>
        <view class="row last"><text class="label strong">押金</text><text class="val gray">{{ order.deposit }}(冻结中)</text></view>
      </view>

      <!-- 车辆信息 -->
      <view class="card car">
        <view class="row"><text class="label">车牌号码</text><text class="val green">{{ order.car.plate }}</text></view>
        <view class="row">
          <text class="label">是否违章 <text class="info">i</text></text>
          <view class="val link" @click="checkViolation">查询中 ></view>
        </view>
        <view class="row last"><text class="label">取还照片</text><view class="val link" @click="viewPhotos">点击查看</view></view>
      </view>

      <!-- 订单信息 -->
      <view class="card order">
        <view class="row"><text class="label">订单编号</text><text class="val mono">{{ order.orderNum }}</text></view>
        <view class="row"><text class="label">行驶里程</text><text class="val">{{ order.mileage }}公里</text></view>
        <view class="row"><text class="label">用车时长</text><text class="val">{{ order.duration }}</text></view>
        <view class="row"><text class="label">取车时间</text><text class="val mono">{{ order.startTime }}</text></view>
        <view class="row"><text class="label">还车时间</text><text class="val mono">{{ order.endTime }}</text></view>
        <view class="row"><text class="label">取车网点</text><text class="val">{{ order.pickNet }}</text></view>
        <view class="row last"><text class="label">还车网点</text><text class="val wrap">{{ order.returnNet }}</text></view>
      </view>

      <view style="height: 60rpx;"></view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
	import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'

const serviceAvatar = '/static/service/bot.png' // 放一张 96×96 的圆形头像

const order = ref({
  totalAmount: 32.5,
  fee: { time: 28.0, mileage: 14.5, insurance: 5.0, dispatch: 0.0, service: 5.0, battery: 0.0 },
  packageUsed: '',
  couponDiscount: 0,
  deposit: 800,
  car: { plate: '闽C·D12345' },
  orderNum: '018841620250729081106',
  mileage: 60,
  duration: '3小时20分钟',
  startTime: '2025-07-29 10:10:10',
  endTime: '2025-08-01 10:10:10',
  pickNet: '丰泽区｜坪山加油站（勿停充电桩）',
  returnNet: '晋江市｜溜溪花园（停车勿超过石墩）勿停收费处，靠右侧树边停车，左边过道不能停，否则后果自负）'
})

onLoad((q:any) => {
  // q.orderNum && loadOrder(q.orderNum)
})

function loadOrder(orderNum: string) {
  // TODO: 接口对接
  // uni.request({ url: `/api/order/detail/${orderNum}`, success: ({ data }) => order.value = mapResp(data) })
}

function contactService(){ uni.showToast({ title:'联系客服', icon:'none' }) }
function checkViolation(){ uni.showToast({ title:'违章查询中', icon:'none' }) }
function viewPhotos(){ uni.showToast({ title:'查看取还照片', icon:'none' }) }
function money(n: number | string){ const v=typeof n==='string'?parseFloat(n):n; return (v||0).toFixed(2) }
</script>

<style scoped lang="scss">
.page{ min-height:100vh; background:#F7F8FA; }

/* 标题栏右侧图标组（胶囊感） */
.nav-right .pill{
  height: 60rpx; padding: 0 18rpx; border-radius: 30rpx;
  background: rgba(255,255,255,.35);
  display:flex; align-items:center; gap:14rpx;
}
.dot{ width:16rpx; height:16rpx; border-radius:50%; background:#0F0F0F; opacity:.9; }
.cam{ width:40rpx; height:40rpx; border:4rpx solid #0F0F0F; border-radius:50%; }

/* 绿色承接背景，与标题栏渐变一致；高度略低于 500rpx，留给内容贴合 */
.hero{
  width: 100%;
  background: linear-gradient(180deg, #5EDC84 0%, #3DCD75 100%);
  padding: 12rpx 24rpx 24rpx;
}

/* 状态块 */
.state{
  margin-top: 6rpx;
  display: flex; align-items: center;
  .ok-ico{
    width: 72rpx; height: 72rpx; border-radius: 50%; background:#fff;
    text-align:center; line-height:72rpx; font-size:44rpx; color:#2ACB62;
    box-shadow: 0 8rpx 16rpx rgba(0,0,0,.06);
  }
  .state-text{ margin-left: 16rpx;
    .t1{ font-size: 40rpx; font-weight: 800; color:#0F0F0F; }
    .t2{ font-size: 26rpx; color: rgba(0,0,0,.6); margin-top: 4rpx; }
  }
  .service{ margin-left:auto; display:flex; flex-direction:column; align-items:center;
    .avatar{ width:96rpx; height:96rpx; border-radius:50%; border:4rpx solid rgba(255,255,255,.8); background:#fff; }
    .svc-text{ margin-top:6rpx; font-size:24rpx; color:#0F0F0F; opacity:.9; }
  }
}

/* 主体滚动区：把第一张卡片上顶到绿色块下缘 */
.content{
  margin-top: -10rpx; /* 细微上移让卡片更贴合，按视觉微调 */
  height: calc(100vh - 360rpx);
}

/* 卡片通用 */
.card{
  background:#fff; border-radius:20rpx; margin:20rpx 24rpx 0; padding:20rpx 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.04);

  .row{
    min-height:64rpx; display:flex; align-items:center; justify-content:space-between;
    padding:12rpx 0; border-bottom:1rpx solid #F2F3F5;

    .label{ font-size:28rpx; color:#24272B; display:flex; align-items:center; gap:8rpx; }
    .strong{ font-weight:600; }
    .info{ width:28rpx; height:28rpx; border-radius:50%; background:#EEF4FF; color:#4E83FF; font-size:20rpx; text-align:center; line-height:28rpx; }
    .val{ font-size:28rpx; color:#FF8A00; }
    .gray{ color:#9AA1A7; }
    .green{ color:#00B578; font-weight:600; }
    .link{ color:#00B578; }
    .mono{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono","Courier New", monospace; }
    .wrap{ white-space:normal; text-align:right; }
  }
  .row.last{ border-bottom:0; }
}

/* 费用卡片右上角总价 */
.fee{ position:relative; padding-top:28rpx;
  .fee-total{ position:absolute; right:24rpx; top:16rpx; font-weight:800; font-size:44rpx; color:#FF2D2D; }
}
.order .row .label{ color:#60666B; }
.order .row .val{ color:#24272B; }
</style>
