<!-- pages/order/index.vue — v2.2 固定底部 + 整屏可滚动 + 事件补齐 -->
<template>
  <view class="page">
    <!-- 整页原生滚动：只用普通 view 即可 -->
    <view class="content">

      <!-- 顶部渐变 & 车卡（省略你已对齐蓝湖的细节，保持不变） -->
      <view class="hero">
        <view class="topbar">
          <text class="back" @click="goBack">‹</text>
          <text class="title">下单</text>
          <view class="ops"><view class="dot"></view><view class="dot"></view><view class="cam"></view></view>
        </view>

        <view class="car-card">
          <image class="che-bg" src="/static/icons/che-bg.png" mode="aspectFit" />
          <view class="car-row">
            <image class="car-img" :src="carInfo.image || '/static/car1.png'" mode="aspectFit" />
            <view class="info">
              <view class="plate">
                <text class="plate-pro">闽</text><text class="plate-mid">C·</text>
                <text class="plate-num">{{ plateTail }}</text>
              </view>

              <view class="model">
                <image class="qiche" src="/static/icons/qiche.png" />
                <text class="model-text">{{ carInfo.carModel || '帝豪EV300' }}</text>
                <view class="vline"></view><text class="seat">{{ carInfo.seatNum || 5 }}座</text>
              </view>

              <view class="stats">
                <view class="stat"><view class="dot-lv"></view><text class="stat-txt">{{ battPct }}%</text></view>
                <view class="stat"><view class="circle-lv"></view><text class="stat-txt">{{ remainKm }}km</text></view>
              </view>
            </view>
          </view>

          <view class="addr">
            <image class="pin" src="/static/icons/map-hui.png" />
            <text class="addr-text">{{ carInfo.netPointAddr || '晋江市｜溜溪花园（……）' }}</text>
            <view class="nav" v-if="!isPayment" @click="goNavigate">
              <image class="nav-ico" src="/static/icons/daohang-lv.png" />
            </view>
          </view>
        </view>
      </view>

      <view class="hero-spacer"></view>

      <!-- 还车点 -->
      <view class="card">
        <view class="card-hd">还车点</view>
        <view class="return-line">
          <text class="return-tip" v-if="!selectedReturnPoint && !isPayment">未选择还车点</text>
          <text class="return-chosen ell" v-else>{{ selectedReturnPoint || `已选择：${carInfo.netPointName || '—'}` }}</text>

          <view class="btns-right" v-if="!isPayment && !selectedReturnPoint">
            <view class="btn-pill pill-ghost" @click="useSamePoint">同取车点</view>
            <view class="btn-pill pill-main"  @click="chooseReturnPoint">请选择</view>
          </view>
          <view class="btns-right" v-else>
            <view class="btn-pill pill-ghost" @click="chooseReturnPoint">修改</view>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="card">
        <view class="card-hd">费用明细</view>
        <view class="fee-line"><text class="k">时租费用</text><text class="v v-red">¥<text class="din48">{{ fee.time }}</text>/小时 + ¥<text class="din48">{{ fee.mile }}</text>/公里</text></view>
        <view class="fee-line"><text class="k">不计免赔</text><text class="v v-red">¥<text class="din48">{{ fee.nodeduct }}</text></text></view>
        <view class="fee-line"><text class="k">整备服务费</text><text class="v v-red">¥<text class="din48">{{ fee.service }}</text></text></view>
        <view class="fee-line"><text class="k">调度费</text><text class="v v-red">¥<text class="din48">{{ fee.dispatch }}</text></text></view>
        <view class="elec"><view class="elec-ico"></view><text class="elec-text">若还车时续航&lt; 30km，则收取¥200电损费</text></view>
      </view>

      <!-- 套餐/优惠券 -->
      <view class="card">
        <view class="card-hd">套餐信息</view>
        <view class="pkg" @click="navigateToComboList">
          <view class="pkg-left">
            <view class="pkg-title">{{ selectedCombo?.comboId ? '三小时免里程套餐' : '购买套餐更划算哦~' }}</view>
            <view class="pkg-sub" :class="{ red: !!selectedCombo?.comboId }">{{ selectedCombo?.comboId ? '已为您节省20元！' : '限四座车可用' }}</view>
          </view>
          <view class="pkg-cta"><text>{{ selectedCombo?.comboId ? '去更换' : '去购买' }}</text><view class="arrow"></view></view>
        </view>
      </view>

      <view class="card">
        <view class="card-hd">优惠券</view>
        <view class="coupon" @click="navigateToCouponList">
          <text class="coupon-title">{{ selectedCoupon?.couponId ? selectedCoupon.name : '10张优惠券可用，快去选择吧~' }}</text>
          <text class="coupon-cut" v-if="selectedCoupon?.couponId">-￥<text class="din48">{{ fmt(selectedCoupon.discountAmount || 0) }}</text></text>
          <view class="arrow-white" v-else />
        </view>
      </view>

      <!-- 动态占位：跟随是否显示协议而改变高度，保证能滑到最底 -->
      <view class="footer-spacer" :style="{ height: footerSpacer }"></view>
    </view>

    <!-- 固定底部 -->
    <view class="footer-fixed">
      <view class="title-line"><view class="flag"></view><text class="title">预估费用</text></view>
      <view class="subdesc">最终费用以用车结束结算为准，含时租、里程、超时、优惠</view>

      <view class="agree-line" v-if="!isPayment">
        <checkbox-group @change="onAgreeChange">
          <label class="agree-lab">
            <checkbox value="agree" :checked="agree" class="agree-ck" />
            <text class="agree-text">我已阅读并同意
              <text class="link" @click.stop="openAgreement">《租赁服务协议》</text>
              <text class="link" @click.stop="openDisclaimer">《不计免赔说明》</text>
            </text>
          </label>
        </checkbox-group>
      </view>

      <view class="foot-bar">
        <view class="sum">
          <text class="sum-label">优惠后金额</text>
          <view class="sum-val"><text class="yen">¥</text><text class="n din68">{{ isPayment ? orderInfo.totalFee : estimatedFee }}</text><text class="qi" v-if="!isPayment">起</text></view>
        </view>
        <button class="btn-cta" :disabled="(!isPayment && !agree) || isLoading" @click="isPayment ? payAndReturn() : onConfirm()">
          {{ isPayment ? '支付并还车' : '确认同意并用车' }}
        </button>
      </view>
    </view>

    <!-- 控车弹窗（补齐事件） -->
    <control-modal
      :visible="showModal"
      :location="carInfo.netPointName || '未知网点'"
      :range="remainKm"
      :plateNumber="carInfo.carNum || '未知车牌'"
      :ratePerHour="fee.time"
      :ratePerKilometer="fee.mile"
      :startTime="tripStartTime"
      @update:driving-data="handleDrivingDataUpdate"
      @open-door="handleOpenDoor"
      @honk-horn="handleHonkHorn"
      @close-door="handleCloseDoor"
      @find-car="handleFindCar"
      @close="showModal = false"
      @confirm="handleConfirmReturn"
      @cancel="handleCancel"
    />
    <rule-popup ref="rulePopup" @confirm="ConfirmOK" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { preloadCarInfo, openCar, closeCar, hornCar, findCar } from '../api/index.js'
import { createOrder, settleOrder, payOrder, getOrderDetail } from '../api/order.js'
import ControlModal from '@/components/control-modal.vue'
import RulePopup from '@/components/rule-popup/index.vue'

const isPayment = ref(false)
const carInfo = ref({})
const baseFee = ref({})
const selectedCombo = ref({})
const selectedCoupon = ref({})
const selectedCouponId = ref(null)
const selectedCouponName = ref('未选择优惠券')
const selectedReturnPoint = ref('')

const userId = ref(0)
const carId = ref(0)
const isLoading = ref(false)
const agree = ref(false)
const showModal = ref(false)

const orderInfo = ref({ orderId:null, orderNum:'', totalFee:0, couponDiscount:0, serviceFee:0, notDeductibleFee:0, comboFee:0, useMile:0, useMinutes:0 })

onMounted(()=>{
  // uni.$on('selectCoupon', ({ couponId, name, discountAmount }) => {
  //   selectedCouponId.value = couponId
  //   selectedCouponName.value = name
  //   selectedCoupon.value = { couponId, name, discountAmount }
  // })
  
    uni.$on('selectCoupon', (coupon) => {
      this.selectedCoupon = coupon
    })
    
    uni.$on('selectCombo', (combo) => {
      this.selectedCombo = combo
    })
})

onLoad(async (options)=>{
  userId.value = Number(uni.getStorageSync('userId') || 0)
  carId.value  = Number(options.carId || uni.getStorageSync('tempCarId') || 0)
  selectedCouponId.value = options.couponId || null
  selectedCouponName.value = decodeURIComponent(options.name || '未选择优惠券')
  isPayment.value = (options.isPayment === true || options.isPayment === 'true')

  if (!carId.value) { uni.showToast({ title:'缺少车辆ID', icon:'none' }); return }

  try{
    const res = await preloadCarInfo({ carId:carId.value, leaseType:'hour', userId:userId.value })
    const data = res?.data || {}
    carInfo.value = data.car || {}
    baseFee.value = data.baseFee || {}

    if (isPayment.value) {
      const orderNum = options.orderNum || uni.getStorageSync('currentOrderNum')
      if (orderNum) await loadOrderInfo(orderNum)
      showModal.value = true
    }
  }catch(e){ uni.showToast({ title:'加载失败', icon:'none' }) }
})

/* —— 计算 —— */
const plateTail = computed(()=> (carInfo.value.carNum || '闽C·D04187').replace(/^..(.*)$/,'$1'))
const battPct   = computed(()=> Number(carInfo.value.restEnergy ?? 41))
const remainKm  = computed(()=>{
  const v = carInfo.value.remainMile ?? 125
  return typeof v === 'number' ? Number(v).toFixed(2) : v || '125.00'
})
const fee = computed(()=>({
  time:Number(baseFee.value?.timeRent || 8),
  mile:Number(baseFee.value?.mileRent || 0.9),
  nodeduct:Number(baseFee.value?.notDeductibleFee || 5),
  service:Number(baseFee.value?.serviceFee || 5),
  dispatch:Number(baseFee.value?.dispatchFee || 0)
}))
const estimatedFee = computed(()=>{
  const v = fee.value.nodeduct + fee.value.service + fee.value.dispatch - Number(selectedCoupon.value?.discountAmount || 0)
  return v > 0 ? v : 0
})
function fmt(n){ const v=Number(n||0); return Number.isFinite(v)?(v%1?Number(v.toFixed(2)):v):0 }

/* —— 动态底部占位：未支付态更高（含协议），含安全区 —— */
const footerSpacer = computed(()=>{
  const base = isPayment.value ? 200 : 280; // 你可微调：用车中≈200rpx，未支付≈280rpx
  return `calc(${base}rpx + env(safe-area-inset-bottom))`;
})

/* —— 通用 —— */
function goBack(){ uni.navigateBack({ delta:1 }) }
function goNavigate(){
  if (!carInfo.value.latitude || !carInfo.value.longitude) return
  uni.openLocation({ latitude:Number(carInfo.value.latitude), longitude:Number(carInfo.value.longitude), name:carInfo.value.netPointName || '还车点' })
}
function useSamePoint(){ selectedReturnPoint.value = carInfo.value.netPointName || '同取车点' }
function chooseReturnPoint(){ /* TODO: 跳转选择页 */ }
function navigateToComboList(){ uni.setStorageSync('tempCarId',carId.value); uni.navigateTo({ url:`/pages/coupon/index?carId=${carId.value}&isPayment=${isPayment.value}&defaultTab=combo` }) }
function navigateToCouponList(){ uni.setStorageSync('tempCarId',carId.value); uni.navigateTo({ url:`/pages/coupon/index?carId=${carId.value}&isPayment=${isPayment.value}` }) }
function onAgreeChange(e){ agree.value = e.detail.value.includes('agree') }
function openAgreement(){ uni.navigateTo({ url:'/pages/agreement/index' }) }
function openDisclaimer(){ uni.navigateTo({ url:'/pages/disclaimer/index' }) }

/* —— 下单 & 结算/支付（保持你的旧逻辑） —— */
const rulePopup = ref(null)
function onConfirm(){ if(!agree.value) return; rulePopup.value?.open() }

async function ConfirmOK(){
  try{
    isLoading.value = true
    uni.showLoading({ title:'正在锁定车辆...', mask:true })
    const now = new Date()
    const takeTime = now.toISOString()
    const returnTime = new Date(now.getTime()+3*60*60*1000).toISOString()
    const res = await createOrder({
      userId:userId.value, carId:carId.value,
      comboId:selectedCombo.value?.comboId, couponId:selectedCouponId.value,
      orderType:'shortRent', shouldTakeCarTime:takeTime, shouldReturnCarTime:returnTime,
      carInfo:carInfo.value, orderDetails:[]
    })
    const orderNum = res?.data?.orderNum || res?.orderNum
    if (orderNum) uni.setStorageSync('currentOrderNum', orderNum)
    uni.hideLoading(); uni.showToast({ title:'锁定车辆成功', icon:'success' })
    isPayment.value = true; showModal.value = true
    if (orderNum) await loadOrderInfo(orderNum)
  }catch(e){ uni.hideLoading(); uni.showToast({ title:e?.message || '锁定失败', icon:'none' }) }
  finally{ isLoading.value=false }
}

async function loadOrderInfo(orderNum){
  try{
    const res = await getOrderDetail(orderNum)
    const o = res?.data || {}
    orderInfo.value = { orderId:o.id, orderNum:o.orderNum, comboFee:o.comboFee||0, notDeductibleFee:o.notDeductibleFee||0, serviceFee:o.serviceFee||0, couponDiscount:o.couponDiscount||0, totalFee:o.totalAmount||0, useMile:o.useMile||0, useMinutes:o.useMinutes||0 }
    selectedCombo.value = { comboId:o.comboId, remarks:o.comboName }
    selectedCoupon.value = { couponId:o.couponId, name:o.couponName || selectedCouponName.value, discountAmount:o.couponDiscount || 0 }
  }catch{ uni.showToast({ title:'订单加载失败', icon:'none' }) }
}

/* —— 控车 & 弹窗事件：补齐 —— */
const tripStartTime = ref(new Date().toISOString())
function handleDrivingDataUpdate(p){ if(!p) return; if(typeof p.useMinutes==='number') orderInfo.value.useMinutes=p.useMinutes; if(typeof p.useMile==='number') orderInfo.value.useMile=p.useMile; if(typeof p.totalFee==='number') orderInfo.value.totalFee=p.totalFee }
async function handleConfirmReturn(){ showModal.value=false; await payAndReturn() }
function handleCancel(){ showModal.value=false }

async function payAndReturn(){
  try{
    isLoading.value = true
    const orderNum = uni.getStorageSync('currentOrderNum') || orderInfo.value.orderNum
    if (!orderNum) return uni.showToast({ title:'订单号缺失', icon:'none' })
    uni.showLoading({ title:'正在结算...', mask:true })
    await settleOrder({ orderNum })
    uni.hideLoading(); uni.showLoading({ title:'支付中...', mask:true })
    const res = await payOrder({ userId:userId.value, orderNum, paymentType:'WECHAT', amount: orderInfo.value.totalFee })
    uni.hideLoading()
    if (res?.success){ uni.showToast({ title:'支付成功', icon:'success' }); setTimeout(()=>uni.redirectTo({ url:'/pages/home/home' }), 1200) }
    else{ uni.showToast({ title: res?.message || '支付失败', icon:'none' }) }
  }catch(e){ uni.hideLoading(); uni.showToast({ title:e?.message || '结算/支付失败', icon:'none' }) }
  finally{ isLoading.value=false }
}

/* 控车包装 */
async function controlCar(api, name){
  try{ isLoading.value=true; uni.showLoading({ title:`正在${name}...`, mask:true }); await api({ carId:carId.value }); uni.hideLoading(); uni.showToast({ title:`${name}成功`, icon:'success' }) }
  catch{ uni.hideLoading(); uni.showToast({ title:`${name}失败`, icon:'none' }) }
  finally{ isLoading.value=false }
}
const handleOpenDoor = () => controlCar(openCar, '开车门')
const handleCloseDoor = () => controlCar(closeCar, '关车门')
const handleHonkHorn  = () => controlCar(hornCar,  '鸣笛')
const handleFindCar   = () => controlCar(findCar,  '找车')
</script>

<style scoped>
/* 页面整体用原生滚动 */
.page{ min-height:100vh; background:#F5F6F9; }
.content{ padding-bottom:0; }

/* 顶部渐变与车卡（同你 v2.0） */
.hero{ position:relative; width:750rpx; height:420rpx; background:linear-gradient(180deg,#5EDC84 0%, #3DCD75 100%); }
.topbar{ height:88rpx; padding:0 24rpx; display:flex; align-items:center; justify-content:space-between; color:#fff; }
.back{ font-size:48rpx; line-height:88rpx; }
.title{ font-size:36rpx; font-weight:600; }
.ops{ display:flex; gap:12rpx; }
.dot{ width:10rpx; height:10rpx; background:#fff; opacity:.7; border-radius:9999rpx; }
.cam{ width:28rpx; height:28rpx; border:2rpx solid rgba(255,255,255,.7); border-radius:9999rpx; }

.car-card{ position:absolute; left:20rpx; top:210rpx; width:710rpx; background:#fff; border-radius:36rpx; box-shadow:0 8rpx 20rpx rgba(0,0,0,.06); padding:24rpx; overflow:hidden; }
.che-bg{ position:absolute; right:24rpx; bottom:44rpx; width:180rpx; height:120rpx; opacity:.15; }
.car-row{ display:flex; gap:24rpx; align-items:flex-start; }
.car-img{ width:280rpx; height:189rpx; }
.info{ flex:1; min-width:0; padding-right:24rpx; }
.plate{ height:60rpx; line-height:60rpx; }
.plate-pro{ font-weight:500; font-size:44rpx; color:#222; margin-right:6rpx; }
.plate-mid,.plate-num{ font-family:D-DIN; font-weight:700; font-size:48rpx; color:#222; }

.model{ margin-top:6rpx; display:flex; align-items:center; gap:10rpx; }
.qiche{ width:28rpx; height:28rpx; }
.model-text{ font-size:28rpx; color:#8A8A8A; }
.vline{ width:2rpx; height:28rpx; background:#DDD; margin:0 6rpx; }
.seat{ font-size:28rpx; color:#8A8A8A; }
.stats{ margin-top:10rpx; display:flex; align-items:center; gap:28rpx; }
.stat{ display:flex; align-items:center; gap:10rpx; }
.dot-lv{ width:18rpx; height:18rpx; background:#34C46E; border-radius:4rpx; }
.circle-lv{ width:18rpx; height:18rpx; border:4rpx solid #34C46E; border-radius:9999rpx; }
.stat-txt{ font-size:30rpx; color:#34C46E; }

.addr{ margin-top:16rpx; display:flex; align-items:flex-start; gap:12rpx; }
.pin{ width:28rpx; height:28rpx; margin-top:6rpx; }
.addr-text{ flex:1; font-size:26rpx; color:#666; line-height:36rpx; white-space:normal; }
.nav{ width:56rpx; height:56rpx; display:flex; align-items:center; justify-content:center; }
.nav-ico{ width:28rpx; height:28rpx; }
.hero-spacer{ height:210rpx; }

/* 白卡 */
.card{ width:710rpx; margin:16rpx auto 0; background:#fff; border-radius:32rpx; }
.card-hd{ padding:24rpx; padding-bottom:0; font-size:36rpx; font-weight:600; color:#222; }

/* 还车点 */
.return-line{ padding:16rpx 24rpx 24rpx; display:flex; align-items:center; }
.return-tip,.return-chosen{ flex:1; font-size:28rpx; color:#888; }
.btns-right{ display:flex; gap:16rpx; }
.btn-pill{ min-width:150rpx; height:56rpx; padding:0 24rpx; border-radius:999rpx; font-size:28rpx; display:flex; align-items:center; justify-content:center; }
.pill-ghost{ background:#FFF7E6; color:#E7A21C; }
.pill-main { background:#FEC74A; color:#7B4A00; }

/* 费用/电损 */
.fee-line{ display:flex; align-items:center; justify-content:space-between; padding:18rpx 24rpx 0; }
.k{ font-size:28rpx; color:#888; }
.v{ font-size:36rpx; color:#FD0300; text-align:right; }
.din48{ font-family:D-DIN; font-weight:700; font-size:48rpx; }
.elec{ display:flex; align-items:center; gap:12rpx; background:#EFFFF2; border-radius:12rpx; margin:18rpx 24rpx 24rpx; padding:12rpx 16rpx; }
.elec-ico{ width:36rpx; height:36rpx; background:#1BBD43; border-radius:6rpx; }
.elec-text{ font-size:30rpx; color:#1BBD43; }

/* 套餐/券 */
.pkg{ margin:24rpx; height:144rpx; border-radius:24rpx; background:linear-gradient(90deg,#FFF3DF 0%, #FFD38A 100%); padding:28rpx; display:flex; align-items:center; justify-content:space-between; }
.pkg-left{ display:flex; flex-direction:column; }
.pkg-title{ font-size:32rpx; font-weight:500; color:#222; }
.pkg-sub{ margin-top:6rpx; font-size:28rpx; color:#666; }
.pkg-sub.red{ color:#E70000; }
.pkg-cta{ width:160rpx; height:64rpx; background:#333; color:#FAC263; border-radius:40rpx; display:flex; align-items:center; justify-content:center; gap:10rpx; }
.arrow{ width:12rpx; height:20rpx; background:#FAC263; border-radius:2rpx; }

.coupon{ margin:24rpx; height:128rpx; border-radius:24rpx; padding:0 24rpx; background:linear-gradient(90deg,#F66600 0%, #FD9A3D 100%); display:flex; align-items:center; justify-content:space-between; color:#fff; }
.coupon-title{ font-size:32rpx; font-weight:500; }
.coupon-cut{ font-size:32rpx; }
.coupon-cut .din48{ font-family:D-DIN; font-weight:700; font-size:48rpx; }
.arrow-white{ width:12rpx; height:20rpx; background:#fff; border-radius:2rpx; }

/* 固定底部 */
.footer-fixed{
  position:fixed; left:0; right:0; bottom:0; z-index:99;
  width:750rpx; background:#fff; box-shadow:0 -4rpx 20rpx rgba(0,0,0,.06);
  border-top-left-radius:24rpx; border-top-right-radius:24rpx;
  padding:20rpx 24rpx 28rpx;
  padding-bottom: calc(28rpx + env(safe-area-inset-bottom));
}
.title-line{ display:flex; align-items:center; gap:12rpx; }
.flag{ width:8rpx; height:36rpx; background:#0DD64B; border-radius:4rpx; }
.title{ font-size:36rpx; font-weight:500; color:#222; }
.subdesc{ margin-top:8rpx; color:#AAA; font-size:24rpx; line-height:36rpx; }
.agree-line{ margin-top:14rpx; }
.agree-lab{ display:flex; gap:12rpx; }
.agree-text{ font-size:28rpx; color:#444; }
.link{ color:#07BF4A; }
.foot-bar{ margin-top:18rpx; display:flex; align-items:center; justify-content:space-between; }
.sum-label{ font-size:32rpx; color:#F38E13; }
.sum-val{ display:flex; align-items:flex-end; gap:6rpx; margin-top:6rpx; }
.yen{ font-family:D-DIN; font-weight:700; font-size:36rpx; color:#FD0300; }
.din68{ font-family:D-DIN; font-weight:700; font-size:68rpx; color:#FD0300; line-height:60rpx; }
.qi{ font-size:24rpx; color:#AAA; margin-bottom:6rpx; }
.btn-cta{ width:368rpx; height:96rpx; border-radius:48rpx; background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%); color:#fff; font-size:40rpx; font-weight:500; display:flex; align-items:center; justify-content:center; }
.btn-cta:disabled{ opacity:.5; }

/* 动态占位元素（不影响交互） */
.footer-spacer{ pointer-events:none; }
.ell{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
</style>
