<!-- pages/order/index.vue -->
<template>
  <view class="page">
    <scroll-view class="scroll" scroll-y>
      <!-- 顶部渐变区 -->
      <view class="hero">
        <TitleBar title="下单" background="transparent" />
        <!-- 车辆卡 -->
        <view class="car-card">
          <image class="che-bg" src="@/static/icons/che-bg.png" mode="widthFix" />
          <view class="car-row">
            <image class="car-img" :src="carInfo.image || '/static/car1.png'" mode="widthFix" />
            <view class="info">
              <!-- 牌照 -->
              <view class="plate">
                <text class="plate-pro">闽</text>
                <text class="plate-mid">C·</text>
                <text class="plate-num">{{ plateTail }}</text>
              </view>
              <!-- 型号/座位 -->
              <view class="model">
                <image class="qiche" src="/static/icons/qiche.png" />
                <text class="model-text">{{ carInfo.carModel || '帝豪EV300' }}</text>
                <view class="vline"></view>
                <text class="seat">{{ carInfo.seatNum || 5 }}座</text>
              </view>
              <!-- 电量 / 续航 -->
              <view class="stats">
                <view class="stat">
                  <image class="ico-stat" src="/static/icons/battery.png" />
                  <text class="stat-txt">{{ battPct }}%</text>
                </view>
                <view class="stat">
                  <image class="ico-stat" src="/static/icons/licheng.png" />
                  <text class="stat-txt">{{ remainKm }}km</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 地址 + 导航 -->
          <view class="addr">
            <image class="pin" src="/static/icons/map-hui.png" />
            <text class="addr-text">
              {{ carInfo.netPointAddr || '晋江市｜溜溪花园（停车勿超过石墩勿停收费处，靠右侧树边停车，左边过道不能停，否则后果自负）' }}
            </text>
            <view class="nav" v-if="!isPayment" @tap="goNavigate">
              <image class="nav-ico" src="/static/icons/daohang-lv.png" />
            </view>
          </view>
        </view>
      </view>

      <!-- 占位（避开悬浮车卡） -->
      <view class="hero-spacer"></view>

      <!-- 还车点 -->
      <view class="card card-return">
        <view class="card-hd">还车点</view>
        <view class="return-line">
          <text class="return-tip" v-if="!selectedReturnPoint && !isPayment">未选择还车点</text>
          <text class="return-chosen ell" v-else>{{ selectedReturnPoint }}</text>

          <view class="btns-right" v-if="!isPayment && !selectedReturnPoint">
            <view class="btn-pill pill-outline" @tap="useSamePoint">同取车点</view>
            <view class="btn-pill pill-grad" @tap="chooseReturnPoint"><text class="btn-text">请选择</text></view>
          </view>
          <view class="btns-right" v-else>
            <view class="btn-pill pill-grad" @tap="chooseReturnPoint"><text class="btn-text">修改</text></view>
          </view>
        </view>
      </view>

      <!-- 费用明细 -->
      <view class="card">
        <view class="card-hd fee-hd">
          <text>费用明细</text>
          <image class="info-ico" src="/static/icons/infor.png" @tap="showFee=true" />
        </view>

        <!-- 统一循环 -->
        <view class="fee-line" v-for="row in feeRowsUI" :key="row.key">
          <text class="k">{{ row.label }}</text>

          <view class="v-r" :class="{'v-r-rent': row.key==='rent', 'v-r-nd': row.key==='nodeduct'}">
            <!-- 时租：富文本 -->
            <view v-if="row.key==='rent'" class="rent-html" v-html="row.rightHtml"></view>

            <!-- 其它：灰条在右侧 + 红价 -->
            <template v-else>
              <view v-if="row.key==='nodeduct'" class="badge-gray">5元/小时，每单25元封顶</view>
              <view class="price">
                <text class="yen-sm">¥</text>
                <text class="din-price">{{ row.price }}</text>
              </view>
            </template>
          </view>
        </view>

        <!-- 若还车提示（切图+一行显示） -->
        <view class="elec elec--oneline">
          <image class="elec-ico" src="@/static/icons/warn.png" mode="aspectFit" />
          <text class="elec-text">若还车时续航＜30km，则收取¥200电损费</text>
        </view>
      </view>

      <!-- 计费说明弹层 -->
      <fee-explain-sheet :visible="showFee" @close="showFee=false" />

      <!-- 套餐信息 -->
      <view class="card pkg-card">
        <view class="card-hd">套餐信息</view>
        <view class="pkg-inner" @tap="navigateToComboList">
          <view class="pkg-left">
            <text class="pkg-title">{{ selectedCombo?.remarks || '三小时免里程套餐' }}</text>
            <text class="pkg-sub" :class="{ red: !!selectedCombo?.comboId }">
              {{
                selectedCombo?.comboId
                  ? (comboSaving > 0 ? `已为您节省${fmt(comboSaving)}元！` : '套餐已选择')
                  : '套餐未选择'
              }}
            </text>
          </view>

          <view class="pkg-cta">
            <text class="cta-text">{{ selectedCombo?.comboId ? '去更换' : '去购买' }}</text>
            <image class="cta-arrow" src="@/static/icons/goumai.png" mode="scaleToFill" />
          </view>
        </view>
      </view>

      <!-- 优惠券 -->
      <view class="card coupon-card">
        <view class="card-hd">优惠券</view>
        <view class="coupon-inner" @tap="navigateToCouponList">
          <text class="coupon-title ell">
            {{ selectedCoupon?.couponId ? (selectedCoupon.name || '优惠券') : '新用户注册10元券' }}
          </text>
          <view class="coupon-right">
            <view class="off" v-if="selectedCoupon?.couponId">
              <text class="off-minus">-</text>
              <text class="off-yen">￥</text>
              <text class="off-num din-number">{{ fmt(selectedCoupon.discountAmount || 10) }}</text>
            </view>
            <image class="arr" src="/static/icons/arrow-right-s-line-white.png" />
          </view>
        </view>
      </view>

      <view class="footer-spacer" :style="{ height: footerSpacer }"></view>
    </scroll-view>

    <!-- 预估费用（底栏 蓝湖1:1） -->
    <view class="footer-fixed">
      <!-- 标题行 -->
      <view class="title-row">
        <view class="flag"></view>
        <text class="title">预估费用</text>
      </view>
      <!-- 说明 -->
      <text class="subdesc">最终费用以用车结束结算为准， 含时租、 里程、 超时、 优惠</text>
      <view class="divider"></view>

      <!-- 勾选行（蓝圈白勾；点整行弹出协议流程） -->
   <!-- 勾选行 -->
   <view class="agree-line" @tap="openAgreementFlow">
     <view class="ck-ico" :class="{ on: agree }">
       <text class="ck-tick">✓</text>
     </view>
     <text class="agree-text">
       我已阅读并同意
       <text class="link" @tap.stop="openAgreementFlow">《租赁服务协议》</text>
       <text class="link" @tap.stop="openAgreementFlow">《不计免赔说明》</text>
     </text>
   </view>


      <!-- 金额 + 按钮 同行且不遮挡 -->
      <view class="foot-bar">
        <view class="sum">
          <text class="sum-label">优惠后金额</text>
          <view class="sum-val">
            <text class="yen">¥</text>
            <text class="n din68">{{ bottomAmount }}</text>
            <text class="qi" v-if="!isPayment">起</text>
          </view>
        </view>

        <button
          class="btn-cta"
          :disabled="(!agree) || isLoading"
          :loading="isLoading"
          @tap="isPayment ? handlePay() : onConfirm()"
        >
          {{ isPayment ? '支付并还车' : '确认同意并用车' }}
        </button>
      </view>
    </view>

    <!-- 协议+签名流程（签完才允许勾选） -->
    <agreement-flow-sheet
      :visible="showAgreeSheet"
      @finished="onAgreeFinished"
      @close="onAgreeClose"
    />

    <!-- 控车弹窗等 -->
    <control-modal
      ref="ctrl"
      :visible="showModal"
      snap="half"
      :location="carInfo.netPointName"
      :range="remainKm"
      :plateNumber="carInfo.carNum"
      :carImage="carInfo.image || '/static/car1.png'"
      :carModel="carInfo.carModel"
      :seatNum="carInfo.seatNum"
      :batteryPct="battPct"
      :ratePerHour="fee.time"
      :ratePerKilometer="fee.mile"
      :startTime="tripStartTime"
      @update:driving-data="handleDrivingDataUpdate"
      @open-door="handleOpenDoor"
      @close-door="handleCloseDoor"
      @honk-horn="handleHonkHorn"
      @confirm="handleConfirmReturn"
      @close="showModal=false"
    />
    <rule-popup ref="rulePopup" @confirm="ConfirmOK" />
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import TitleBar from '@/components/header/TitleBar.vue'
import ControlModal from '@/components/control-modal.vue'
import RulePopup from '@/components/rule-popup/index.vue'
import AgreementFlowSheet from '@/components/agreement-flow-sheet.vue'
import FeeExplainSheet from '@/components/FeeExplainSheet.vue'

import { preloadCarInfo, openCar, closeCar, hornCar } from '@/api/index.js'
import { createOrder, settleOrder, payOrder } from '@/api/order.js'
import { getWalletBalance } from '@/api/wallet.js'

import { useOrderPricing } from '@/composables/useOrderPricing'
import { useCoupons } from '@/composables/useCoupons'

/* ========= state ========= */
const isPayment = ref(false)
const userId = ref(0)
const carId = ref(0)

const carInfo = ref({})
const baseFee = ref({})
const comboList = ref([])
const couponList = ref([])

const selectedCombo = ref({})
const selectedCoupon = ref({})
const selectedPackage = ref('')
const selectedCouponId = ref(null)

const agree = ref(false)
const showModal = ref(false)
const isLoading = ref(false)
const showFee = ref(false)
const showAgreeSheet = ref(false)

const orderInfo = ref({
  orderId: null, orderNum: '',
  comboFee: 0, notDeductibleFee: 0, serviceFee: 0,
  couponDiscount: 0, totalFee: 0
})

/* ========= 协议流程 ========= */
function openAgreementFlow(){ showAgreeSheet.value = true }
function onAgreeFinished(){ agree.value = true; showAgreeSheet.value = false }
function onAgreeClose(){ showAgreeSheet.value = false }

/* ========= 还车点：刷新保留；只有换车才清空 ========= */
const STORAGE_CAR_ID = 'order:currentCarId'
const STORAGE_RP     = 'order:returnPoint:current'

const selectedReturnPoint = ref('')
const returnPoint = ref({ id:null, name:'', address:'', latitude:null, longitude:null })

function readStoredRP() {
  const obj = uni.getStorageSync(STORAGE_RP)
  return obj && typeof obj === 'object' ? obj : null
}
function writeStoredRP() {
  uni.setStorageSync(STORAGE_RP, { carId: Number(carId.value||0), rp: returnPoint.value || null })
  uni.setStorageSync(STORAGE_CAR_ID, Number(carId.value||0))
}
function bindEmptyForCurrentCar() {
  selectedReturnPoint.value = ''
  returnPoint.value = { id:null, name:'', address:'', latitude:null, longitude:null }
  uni.setStorageSync(STORAGE_RP, { carId: Number(carId.value||0), rp: null })
  uni.setStorageSync(STORAGE_CAR_ID, Number(carId.value||0))
}
function syncReturnPointWithCar() {
  if (!carId.value) return
  const curId = Number(carId.value)
  const saved = readStoredRP()
  const savedCarId = Number(uni.getStorageSync(STORAGE_CAR_ID) || 0)

  if (!saved && !savedCarId) { bindEmptyForCurrentCar(); return }
  if (savedCarId !== curId)  { bindEmptyForCurrentCar(); return }
  if (saved && saved.carId === curId && saved.rp && saved.rp.name) {
    returnPoint.value = saved.rp
    selectedReturnPoint.value = `已选择：${saved.rp.name}`
  } else {
    selectedReturnPoint.value = ''
    returnPoint.value = { id:null, name:'', address:'', latitude:null, longitude:null }
  }
}

// 同取车点
function useSamePoint () {
  const rp = {
    id:  carInfo.value.netPointId || carInfo.value.netPointID || null,
    name: carInfo.value.netPointName || '',
    address: carInfo.value.netPointAddr || '',
    latitude: Number(carInfo.value.latitude ?? 0),
    longitude: Number(carInfo.value.longitude ?? 0)
  }
  returnPoint.value = rp
  selectedReturnPoint.value = rp.name ? `已选择：${rp.name}` : ''
  writeStoredRP()
}

// 选择网点
function chooseReturnPoint () {
  uni.navigateTo({
    url: '/pages/map/index?mode=selectReturn',
    events: {
      returnPointSelected(data) {
        const { id, name, address, latitude, longitude } = data || {}
        const rp = { id:id??null, name:name||'', address:address||'', latitude:Number(latitude??0), longitude:Number(longitude??0) }
        returnPoint.value = rp
        selectedReturnPoint.value = name ? `已选择：${name}` : ''
        writeStoredRP()
      }
    }
  })
}
watch(carId, (nv, ov) => { if (ov && nv !== ov) bindEmptyForCurrentCar() })

/* ========= 计价 ========= */
const { feeRows, comboSaving, bottomAmount, timeRent, mileRent } = useOrderPricing({
  baseFeeRef: baseFee,
  selectedComboRef: selectedCombo,
  selectedCouponRef: selectedCoupon,
  isPaymentRef: isPayment,
  orderInfoRef: orderInfo
})
const fee = computed(() => ({ time: timeRent.value, mile: mileRent.value }))

const { buildCouponNavigateParams } = useCoupons({
  couponListRef: couponList, selectedCouponRef: selectedCoupon
})

/* ========= computed / helpers ========= */
const footerSpacer = computed(() => `calc(${isPayment.value ? 200 : 340}rpx + env(safe-area-inset-bottom))`)
const plateTail = computed(() => (carInfo.value.carNum || '闽C·D04187').replace(/^..(.*)$/,'$1'))
const battPct = computed(() => Number(carInfo.value.restEnergy ?? 41))
const remainKm = computed(() => {
  const v = carInfo.value.remainMile ?? 125
  return typeof v === 'number' ? Number(v).toFixed(2) : v || '125.00'
})
function fmt(n){ const v=Number(n||0); return Number.isFinite(v)?(v%1?Number(v.toFixed(2)):v):0 }

/* ========= lifecycle ========= */
onMounted(() => {
  uni.$on('selectCoupon', ({ couponId, name, discountAmount }) => {
    selectedCouponId.value = couponId
    selectedCoupon.value = { couponId, name, discountAmount }
    uni.setStorageSync('tempCoupon', selectedCoupon.value)
  })
  uni.$on('selectCombo', ({ comboId, comboRent, remarks, originPrice, saveAmount }) => {
    selectedCombo.value = { comboId, comboRent, remarks, originPrice, saveAmount }
    uni.setStorageSync('tempCombo', selectedCombo.value)
  })
})

onLoad(async (options) => {
  const lastCarId = Number(uni.getStorageSync(STORAGE_CAR_ID) || 0)
  carId.value = Number((options && options.carId) ?? uni.getStorageSync('tempCarId') ?? lastCarId ?? 0)

  userId.value = Number(uni.getStorageSync('userId') || 0)
  isPayment.value = (options?.isPayment === true || options?.isPayment === 'true')

  selectedPackage.value = uni.getStorageSync('tempPackage') || ''
  selectedCombo.value   = uni.getStorageSync('tempCombo') || {}
  selectedCoupon.value  = uni.getStorageSync('tempCoupon') || {}

  syncReturnPointWithCar()

  if (!carId.value) { uni.showToast({ title:'缺少车辆ID', icon:'none' }); return }

  try {
    const [carRes] = await Promise.all([
      preloadCarInfo({ carId:carId.value, leaseType:'hour', userId:userId.value }),
      getWalletBalance('accountBalance').catch(()=>({ data:0 }))
    ])
    const data = carRes?.data || {}
    carInfo.value = data.car || {}
    baseFee.value = data.baseFee || {}
    comboList.value = data.comboList || []
    couponList.value = data.couponList || []
  } catch (e) {
    console.error('初始化失败:', e)
    uni.showToast({ title:'加载失败', icon:'none' })
  }
})

/* ========= UI actions ========= */
function goNavigate(){
  if (!carInfo.value.latitude || !carInfo.value.longitude) return
  uni.openLocation({ latitude:Number(carInfo.value.latitude), longitude:Number(carInfo.value.longitude), name:carInfo.value.netPointName || '网点' })
}
function navigateToCouponList(){
  uni.setStorageSync('tempPackage', selectedPackage.value)
  uni.setStorageSync('tempCombo', selectedCombo.value)
  uni.setStorageSync('tempIsPayment', isPayment.value)
  uni.setStorageSync('tempCarId', carId.value)
  uni.navigateTo({ url: buildCouponNavigateParams({ carId: carId.value, isPayment: isPayment.value, defaultTab: 'coupon' }) })
}
function navigateToComboList(){
  uni.setStorageSync('tempPackage', selectedPackage.value)
  uni.setStorageSync('tempCombo', selectedCombo.value)
  uni.setStorageSync('tempIsPayment', isPayment.value)
  uni.setStorageSync('tempCarId', carId.value)
  uni.navigateTo({ url: buildCouponNavigateParams({ carId: carId.value, isPayment: isPayment.value, defaultTab: 'combo' }) })
}

function openPopup(){ rulePopup.value?.open ? rulePopup.value.open() : ConfirmOK() }
async function onConfirm(){
  if (!agree.value && !isPayment.value) { uni.showToast({ title:'请先勾选协议', icon:'none' }); return }
  openPopup()
}

/* ========= order flow ========= */
async function ConfirmOK(){
  try{
    isLoading.value = true
    uni.showLoading({ title:'正在锁定车辆...', mask:true })

    const now = new Date()
    const takeTime = now.toISOString()
    const returnTime = new Date(now.getTime()+3*60*60*1000).toISOString()

    const orderDetails = [
      { name:'时租费用', price:0, quantity:1, unit:'小时', businessType:'comboRent', type:'shortRent', remark:'套餐租金明细' },
      { name:'不计免赔', price: baseFee.value.notDeductibleFee || 5, quantity:1, unit:'件', businessType:'comboIsNoDeductibleCostRent', type:'shortRent', remark:'不计免赔明细' },
      { name:'整备服务费', price: baseFee.value.serviceFee || 0, quantity:1, unit:'组', businessType:'serviceFee', type:'shortRent', remark:'整备服务费明细' },
      { name:'优惠券折扣', price: 0, quantity:1, unit:'个', businessType:'couponDiscount', type:'shortRent', remark:'优惠券折扣明细' },
    ]

    const res = await createOrder({
      userId: userId.value,
      carId: carId.value,
      comboId: selectedPackage.value || selectedCombo.value?.comboId,
      couponId: selectedCouponId.value || selectedCoupon.value?.couponId,
      orderType: 'shortRent',
      shouldTakeCarTime: takeTime,
      shouldReturnCarTime: returnTime,
      returnNetPointId:   returnPoint.value.id,
      returnNetPointName: returnPoint.value.name,
      returnLatitude:     returnPoint.value.latitude,
      returnLongitude:    returnPoint.value.longitude,
      carInfo: carInfo.value,
      orderDetails
    })

    const orderNum = res?.data?.orderNum || res?.orderNum
    if (orderNum) uni.setStorageSync('currentOrderNum', String(orderNum))

    uni.hideLoading()
    uni.showToast({ title:'锁定车辆成功', icon:'success' })
    isPayment.value = true
    showModal.value = true
  }catch(error){
    console.error(error)
    uni.hideLoading()
    uni.showToast({ title: error?.message || '锁定车辆失败', icon:'none' })
  }finally{
    isLoading.value = false
  }
}

async function handleConfirmReturn(){
  isLoading.value = true
  try{
    uni.showLoading({ title:'正在结算订单...', mask:true })
    const orderNum = uni.getStorageSync('currentOrderNum')
    await settleOrder({ orderNum })
    uni.showToast({ title:'结算成功', icon:'none' })
    isPayment.value = true
    showModal.value = false
  }catch(error){
    uni.showToast({ title: error?.message || '结算失败', icon:'none' })
  }finally{
    uni.hideLoading()
    isLoading.value = false
  }
}

async function handlePay(){
  if (!agree.value && !isPayment.value) return
  const orderNum = uni.getStorageSync('currentOrderNum')
  uni.showLoading({ title:'支付中...' })
  try{
    const res = await payOrder({ userId: userId.value, orderNum, paymentType:'WECHAT', amount: orderInfo.value.totalFee })
    uni.hideLoading()
    if (res?.success){
      uni.showToast({ title:'支付成功', icon:'success' })
      setTimeout(()=> uni.redirectTo({ url:'/pages/home/home' }), 1200)
    }else{
      uni.showToast({ title: res?.message || '支付失败', icon:'none' })
    }
  }catch(e){
    uni.hideLoading()
    uni.showModal({ title:'支付异常', content:'支付过程中发生错误，请稍后重试或联系客服', showCancel:false })
  }
}

/* ========= control modal ========= */
const handleOpenDoor = async () => { try{ await openCar({ carId:carId.value }); uni.showToast({ title:'已开门', icon:'success' }) }catch(e){ uni.showToast({ title:e?.message||'开门失败', icon:'none' }) } }
const handleCloseDoor = async () => { try{ await closeCar({ carId:carId.value }); uni.showToast({ title:'已关门', icon:'success' }) }catch(e){ uni.showToast({ title:e?.message||'关门失败', icon:'none' }) } }
const handleHonkHorn  = async () => { try{ await hornCar({ carId:carId.value });  uni.showToast({ title:'已鸣笛', icon:'success' }) }catch(e){ uni.showToast({ title:e?.message||'鸣笛失败', icon:'none' }) } }
function handleDrivingDataUpdate(_d){}

/* ========= 费用明细行 ========= */
const n = (v, d=0) => { const x = Number(v); return Number.isFinite(x) ? x : d }
const feeRowsUI = computed(() => [
  {
    key: 'rent',
    label: '时租费用',
    rightHtml:
      `¥<span class="din48">${n(baseFee.value?.timeRent, 8)}</span>/小时 + ` +
      `¥<span class="din48">${n(baseFee.value?.mileRent, 0.9)}</span>/公里`
  },
  { key: 'nodeduct', label: '不计免赔', price: n(baseFee.value?.notDeductibleFee, 5) },
  { key: 'service',  label: '整备服务费', price: n(baseFee.value?.serviceFee, 5)  },
  { key: 'dispatch', label: '调度费',     price: n(baseFee.value?.dispatchFee, 0) }
])
</script>

<style scoped>
/* 页面与顶部 */
.page{ min-height:100vh; background:#F5F6F9; display:flex; flex-direction:column; }
.scroll{ flex:1; }
.hero{ position:relative; width:750rpx; height:280rpx; background:linear-gradient(180deg,#5EDC84 0%, #3DCD75 100%); border-bottom-left-radius:24rpx; border-bottom-right-radius:24rpx; }
.car-card{ position:relative; left:20rpx; top:70rpx; width:620rpx; background:#fff; border-radius:36rpx; box-shadow:0 8rpx 20rpx rgba(0,0,0,.06); padding:20rpx 36rpx 24rpx 24rpx; overflow:hidden; }
.che-bg{ position:absolute; right:20rpx; top:0; width:220rpx; opacity:.9; z-index:0; pointer-events:none; }
.car-row,.addr{ position:relative; z-index:1; }
.car-row{ display:flex; gap:24rpx; align-items:flex-start; }
.car-img{ width:280rpx; height:189rpx; display:block; }
.info{ flex:1; min-width:0; padding-right:24rpx; }
.plate{ height:60rpx; line-height:60rpx; }
.plate-pro{ font-weight:500; font-size:44rpx; color:#222; margin-right:6rpx; }
.plate-mid,.plate-num{ font-family:D-DIN; font-weight:700; font-size:48rpx; color:#222; }
.model{ margin-top:6rpx; display:flex; align-items:center; gap:10rpx; }
.qiche{ width:28rpx; height:28rpx; }
.model-text,.seat{ font-size:28rpx; color:#8A8A8A; }
.vline{ width:2rpx; height:28rpx; background:#DDD; margin:0 6rpx; }
.stats{ margin-top:10rpx; display:flex; align-items:center; gap:28rpx; }
.stat{ display:flex; align-items:center; gap:10rpx; }
.ico-stat{ width:28rpx; height:28rpx; }
.stat-txt{ font-size:30rpx; color:#34C46E; }
.addr{ margin-top:16rpx; display:flex; align-items:flex-start; gap:12rpx; padding-right:8rpx; }
.pin{ width:28rpx; height:28rpx; margin-top:6rpx; }
.addr-text{ flex:1; font-size:26rpx; color:#666; line-height:36rpx; white-space:normal; }
.nav{ position:relative; width:64rpx; height:64rpx; display:flex; align-items:center; justify-content:center; }
.nav::before{ content:""; position:absolute; left:-3rpx; top:50%; transform:translateY(-50%); width:2rpx; height:28rpx; background:#EDEDED; border-radius:1rpx; }
.nav-ico{ width:40rpx; height:40rpx; }
.hero-spacer{ height:240rpx; }

/* 卡片通用 */
.card{ width:680rpx; margin:26rpx auto 0; background:#fff; border-radius:32rpx; }
.card-hd{ padding:24rpx; font-size:36rpx; font-weight:600; color:#222; }

/* 还车点 */
.return-line{ padding:12rpx 24rpx 24rpx; display:flex; align-items:center; }
.return-tip,.return-chosen{ flex:1; font-size:28rpx; color:#888; }
.btns-right{ display:flex; gap:16rpx; }
.btn-pill{ min-width:128rpx; height:48rpx; padding:0 20rpx; border-radius:24rpx; font-size:28rpx; display:flex; align-items:center; justify-content:center; }
.pill-outline{ background:#fff; color:#D08A00; border:2rpx solid #F2B54D; }
.pill-grad{ background:linear-gradient(270deg,#FDD41F 0%, #FFC868 100%); }
.pill-grad .btn-text{ width:96rpx; height:48rpx; display:flex; align-items:center; justify-content:center; font-size:28rpx; color:#222; }

/* 费用明细行（左列定宽，右列不挤压） */
.fee-hd{ padding:24rpx; padding-bottom:0; display:flex; align-items:center; gap:12rpx; }
.info-ico{ width:36rpx; height:36rpx; }
.fee-line{ display:flex; align-items:center; padding:18rpx 24rpx 0; }
.k{ width:160rpx; flex:0 0 160rpx; font-size:28rpx; color:#888; } /* 左列固定宽 */
.v-r{ flex:1 1 auto; min-width:0; display:flex; align-items:baseline; justify-content:flex-end; gap:12rpx; }
.badge-gray{ white-space: nowrap; flex: 0 0 auto; }               /* 右侧灰条不换行 */
.v-r-rent{ color:#FD0300; }
.rent-html :deep(.din48){ font-family:D-DIN; font-weight:700; font-size:48rpx; }
.badge-gray{ padding:4rpx 12rpx; background:#F2F3F5; border-radius:8rpx; font-size:24rpx; line-height:32rpx; color:#8A8A8A; white-space:nowrap; flex:0 0 auto; }
.price{ display:flex; align-items:baseline; gap:4rpx; color:#FD0300; flex:0 0 auto; }
.yen-sm{ font-family:D-DIN; font-weight:700; font-size:32rpx; }
.din-price{ font-family:D-DIN; font-weight:700; font-size:48rpx; line-height:44rpx; }

/* 若还车提示（强制一行 + 图标不塌陷） */
.elec{ display:flex; align-items:center; gap:12rpx; margin:18rpx 24rpx 24rpx; padding:12rpx 16rpx; background:#F4FFF7; border-radius:24rpx; }
.elec--oneline{ white-space:nowrap; }
.elec-ico{ width:36rpx; height:36rpx; flex:0 0 36rpx; display:block; }
.elec-text{ font-size:26rpx; line-height:36rpx; color:#1BBD43; }

/* 套餐 */
.pkg-card{ padding-bottom:24rpx; }
.pkg-inner{ width:calc(100% - 90rpx); margin:24rpx auto; height:110rpx; padding:28rpx; border-radius:24rpx; background:linear-gradient(180deg,#FFE8C1 0%, #FFE1AB 100%); display:flex; align-items:center; justify-content:space-between; }
.pkg-left{ display:flex; flex-direction:column; }
.pkg-title{ font-size:32rpx; font-weight:500; color:#222; }
.pkg-sub{ margin-top:8rpx; font-size:28rpx; color:#888; }
.pkg-sub.red{ color:#E70000; }
.pkg-cta{ width:160rpx; height:64rpx; border-radius:40rpx; background:#333; display:flex; align-items:center; justify-content:center; gap:10rpx; }
.cta-text{ font-size:28rpx; color:#FAC263; }
.cta-arrow{ width:20rpx; height:32rpx; }

/* 优惠券 */
.coupon-card{ padding-bottom:24rpx; }
.coupon-inner{ margin:24rpx; width:calc(100% - 90rpx); height:128rpx; border-radius:24rpx; background:linear-gradient(90deg,#F66600 0%, #FD9A3D 100%); padding:0 24rpx; display:flex; align-items:center; justify-content:space-between; }
.coupon-title{ max-width:440rpx; font-size:32rpx; color:#fff; font-weight:500; }
.coupon-right{ display:flex; align-items:center; gap:12rpx; }
.off{ display:flex; align-items:baseline; gap:6rpx; color:#fff; }
.off-minus{ font-size:32rpx; }
.off-yen{ font-family:D-DIN; font-weight:700; font-size:36rpx; }
.off-num{ font-family:D-DIN; font-weight:700; font-size:48rpx; }
.arr{ width:36rpx; height:36rpx; border-radius:20rpx; }

/* 预估费用底栏（蓝湖1:1） */
.footer-fixed{ position:fixed; left:0; right:0; bottom:0; background:#fff; box-shadow:0 -4rpx 20rpx rgba(0,0,0,.06); border-radius:0; padding:24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom)); }
.title-row{ display:flex; align-items:center; gap:16rpx; }
.flag{ width:8rpx; height:36rpx; background:#0DD64B; border-radius:4rpx; }
.title{ width:152rpx; height:50rpx; font-size:36rpx; font-weight:500; line-height:50rpx; color:#222; text-align:center; }
.subdesc{ display:block; margin-top:8rpx; width:696rpx; height:36rpx; font-size:24rpx; line-height:36rpx; color:#AAAAAA; }
.divider{ margin-top:16rpx; width:690rpx; height:0; border-top:2rpx solid #EEEEEE; }

/* 勾选行：蓝圈白勾 */
.agree-line{ margin-top:16rpx; display:flex; align-items:center; gap:16rpx; }

.ck-ico{
  width:36rpx; height:36rpx; border-radius:50%;
  border:2rpx solid #26A7FF;              /* 蓝圈 */
  display:flex; align-items:center; justify-content:center;
  color: transparent;                      /* 未勾选看不到勾 */
}
.ck-ico.on{ background:#26A7FF; color:#fff; }  /* 勾选后蓝底白勾 */
.ck-tick{ font-size:26rpx; line-height:1; transform: translateY(-1rpx); }

.agree-text{ font-size:26rpx; color:#444; line-height:40rpx; }
.link{ color:#07BF4A; }

/* 底栏容器——保持 750rpx，内边距算在内，避免被挤 */
.footer-fixed{
  position: fixed; left: 0; right: 0; bottom: 0;
  box-sizing: border-box;                 /* ★ 很关键 */
  background: #fff; box-shadow: 0 -4rpx 20rpx rgba(0,0,0,.06);
  border-radius: 0;
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
}

/* 金额 + 按钮 同行且不遮挡 */
.foot-bar{
  margin-top: 20rpx;
  display: flex; align-items: center;
  justify-content: space-between;
  gap: 16rpx;                              /* 与按钮“靠近一点” */
}

.sum{
  min-width: 0;                            /* ★ 防止子项超出后把容器撑破 */
}

.sum-label{
  flex: 0 0 auto;
  white-space: nowrap;                     /* ★ 不换行，不会变竖排 */
  font-size: 32rpx; color: #F38E13;
}

.sum-val{
	margin-left: 50rpx;
	
	margin-right: 50rpx;
  height: 56rpx;
  font-family: D-DIN, D-DIN;
  font-weight: 700;
  font-size: 36rpx;
  color: #FD0300;
  line-height: 60rpx;
  text-align: right;
  font-style: normal;
  text-transform: none;                    /* ★ 金额也不换行 */
}

.btn-cta{
  flex: 0 0 368rpx;                        /* ★ 固定 368，保证完整显示 */
  width: 368rpx; height: 96rpx; border-radius: 48rpx;
  background: linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  color:#fff; font-size:40rpx; font-weight:500;
  display:flex; align-items:center; justify-content:center;
}


/* 工具 */
.ell{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
</style>
