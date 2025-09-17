<template>
  <view class="index-root" v-bind="$attrs">
    <!-- 顶部渐变区（蓝湖：750×290，#F66600 -> #FD9A3D） -->
    <view class="header">
      <TitleBar title="卡券套餐" />
      <view class="tabs-on-header">
        <Segment
          :items="[
            { key: 'coupon', text: `优惠券(${couponCount})` },
            { key: 'package', text: `套餐(${packageCount})` }
          ]"
          v-model:active="activeTab"
        />
      </view>
    </view>

    <!-- 一体式钱包 -->
    <WalletFoldCard
      v-model:expanded="walletExpanded"
      :spendable="amounts[0].value"
      :withdrawable="amounts[1].value"
      :depositCar="amounts[2].value"
      :depositIllegal="amounts[3].value"
      @withdraw="goWithdraw"
      @recharge="goRecharge"
    />

    <!-- 页面滚动内容 -->
    <scroll-view scroll-y class="page">
      <!-- 优惠券 -->
      <template v-if="activeTab === 'coupon'">
        <CouponCard
          v-for="c in couponList"
          :key="c.id"
          v-bind="c"
          currency="¥"
          ruleBtnText="使用规则"
          suffixIcon="/static/benefit/car-fade.png"
          :showDashedDivider="true"
          :secondaryBtn="{ visible: !!c.shareable, text: '送给好友' }"
          @rule="onShowRule(c)"
          @cta="onUseCoupon(c)"
          @tap-secondaryBtn="onShare(c)"
        />
      </template>

      <!-- 套餐 -->
      <template v-else>
        <view class="pkg-section-head" @tap="availOpen = !availOpen">
          <text class="pkg-section-title">可用套餐（{{ availablePackages.length }}）</text>
          <image
            class="pkg-fold"
            src="/static/benefit/zhedie.png"
            mode="widthFix"
            :class="{ open: availOpen }"
          />
        </view>

        <view v-show="availOpen">
          <PackageCard
            v-for="p in availablePackages"
            :key="p.id"
            v-bind="p"
            currency="¥"
            ruleBtnText="套餐说明"
            bgWatermark="/static/benefit/car-fade.png"
            :primaryBtn="{ text: '立即使用' }"
            :secondaryBtn="{ text: '送给好友' }"
            @rule="onShowPkgRule(p)"
            @tap-primaryBtn="onUsePackage(p)"
            @tap-secondaryBtn="onSharePackage(p)"
          />
        </view>

        <SectionTitle :text="`购买套餐（${buyablePackages.length}）`" />
        <PackageCard
          v-for="p in buyablePackages"
          :key="p.id"
          v-bind="p"
          currency="¥"
          ruleBtnText="套餐说明"
          bgWatermark="/static/benefit/car-fade.png"
          :footerDashed="true"
          :primaryBtn="{ text: '一键购买', theme: 'dark' }"
          @rule="onShowPkgRule(p)"
          @tap-primaryBtn="onBuyPackage(p)"
        />
      </template>

      <Spacer :size="24" />

      <RuleSheet v-model:visible="ruleVisible" :title="ruleTitle" :content="ruleContent" />
    </scroll-view>

    <!-- 收银台：与 pay.vue 一致的抽屉/遮罩效果 + 取消按钮 + 动态隐藏 -->
    <view
      v-show="cashierVisible"
      class="cashier-root"
      :class="{ closing: animating && translateY > 0, hidden: !cashierVisible }"
    >
      <!-- 点击遮罩触发取消提示 -->
      <view class="cashier-mask" @tap="onCancelPay"></view>

      <view
        class="cashier-sheet"
        :style="sheetStyle"
        @touchstart="onTouchStart"
        @touchmove.stop.prevent="onTouchMove"
        @touchend="onTouchEnd"
        @tap.stop
      >
        <view class="sheet-grip" />
        <view class="sheet-header">
          <text class="title">确认购买</text>
          <text class="close" @tap="onCancelPay">×</text>
        </view>

        <scroll-view scroll-y class="sheet-body">
          <Cashier
            :key="cashierKey"
            v-model:visible="cashierVisible"
            :scene="'PACKAGE'"
            :biz-order-num="cashierOrderNum"
            :package-id="cashierPackageId"
            :user-id="currentUserId"
            :default-amount="cashierAmount"
            :redirect-url="cashierRedirectUrl"
            :allow-mixed="true"
            :enable-wechat="true"
            :enable-alipay="true"
            :show-header="false"
            :button-fixed="false"
            @success="onCashierSuccess"
            @fail="onCashierFail"
          />

          <view style="height:16rpx" />
          <!-- 取消按钮（同遮罩/右上角×逻辑） -->
          <!-- <button class="btn-cancel" @tap="onCancelPay">取消</button> -->
        </scroll-view>

        <view class="safe-bottom" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app'
import { getMyCoupons } from '../../api/coupon'
import { getMyPackages, getBenefitCandidates, giftUserPackage } from '../../api/benefit'
import { getAllBalances } from '../../api/wallet'
import TitleBar from '@/components/header/TitleBar.vue'
import Segment from '@/components/tabs/Segment.vue'
import WalletFoldCard from '@/components/wallet/WalletFoldCard.vue'
import SectionTitle from '@/components/section/Title.vue'
import RuleSheet from '@/components/popup/RuleSheet.vue'
import CouponCard from '@/components/coupon/CouponCard.vue'
import PackageCard from '@/components/package/PackageCard.vue'
import Spacer from '@/components/common/Spacer.vue'
import Cashier from '@/components/cashier/Cashier.vue'

defineOptions({ inheritAttrs: false })

// 需要从父级/路由初始化 tab 时使用
const props = defineProps({
  defaultTab: { type: String, default: '' }
})

const activeTab = ref('coupon')
const walletExpanded = ref(false)
const ruleVisible = ref(false)
const ruleTitle = ref('使用规则')
const ruleContent = ref('')
const availOpen = ref(true)
const carId = ref(null)

const couponList = ref([])
const availablePackages = ref([])
const buyablePackages = ref([])

/** —— 收银台状态 —— */
const cashierVisible = ref(false)
const cashierScene = ref('PACKAGE')
const cashierAmount = ref(0)
const cashierOrderNum = ref('')     // 可为 'p12'
const cashierRedirectUrl = ref('/pages/order/success')
const currentUserId = ref(0)
const cashierPackageId = ref(null)  // ★ 关键：给收银台/后端
const cashierKey = ref(0)

/** —— 抽屉动画/手势（与 pay.vue 一致） —— */
const startY = ref(0)
const translateY = ref(0)
const animating = ref(false)
const closeDistance = 400
const sheetStyle = computed(() => {
  const t = `translateY(${translateY.value}px)`
  const tr = animating.value ? 'transform .18s ease-out' : 'transform 0s'
  return `transform:${t};transition:${tr};`
})

/** 金额格式化 */
function fmtMoney (n = 0) { return `¥ ${Number(n || 0).toFixed(2)}` }

/** 仅接入钱包：加载余额映射到 WalletFoldCard */
async function loadWallet () {
  try {
    const res = await getAllBalances({})
    const d = (res && (res.data || res))?.data || (res && res.data) || {}
    const accountBalance   = d.accountBalance   ?? 0
    const withdrawal       = d.withdrawal       ?? 0
    const deposit          = d.deposit          ?? 0
    const longRentDeposit  = d.longRentDeposit  ?? 0
    const illegalDeposit   = d.illegalDeposit   ?? 0
    const carDeposit = Number(deposit) + Number(longRentDeposit)

    amounts.value = [
      { label: '可消费',   value: fmtMoney(accountBalance) },
      { label: '可提现',   value: fmtMoney(withdrawal) },
      { label: '车辆押金', value: fmtMoney(carDeposit),    sub: '（使用中）' },
      { label: '违章押金', value: fmtMoney(illegalDeposit), sub: '（冻结中）' }
    ]
  } catch (e) {
    console.error('loadWallet error:', e)
    uni.showToast({ title: '钱包数据加载失败', icon: 'none' })
  }
}

const amounts = ref([
  { label: '可消费', value: '¥ 0.00' },
  { label: '可提现', value: '¥ 0.00' },
  { label: '车辆押金', value: '¥ 0.00', sub: '（使用中）' },
  { label: '违章押金', value: '¥ 0.00', sub: '（冻结中）' }
])

/** -------- 打开收银台（接收 packageId 参数） -------- */
function openCashier ({ amount, orderNum, packageId }) {
  cashierScene.value = 'PACKAGE'
  cashierAmount.value = Number(amount || 0)
  cashierOrderNum.value = orderNum || ''
  cashierPackageId.value =
    (packageId != null ? Number(packageId) : null) ??
    (orderNum && /^p\d+$/i.test(String(orderNum)) ? Number(String(orderNum).slice(1)) : null)
  if (!cashierOrderNum.value) return uni.showToast({ title: '缺少订单号', icon: 'none' })
  if (cashierPackageId.value == null) return uni.showToast({ title: '套餐ID异常', icon: 'none' })
  if (!Number.isFinite(cashierAmount.value)) cashierAmount.value = 0
  cashierKey.value += 1
  cashierVisible.value = true
}

/** 手势关闭 */
function onTouchStart(e) { if (!animating.value) startY.value = e.changedTouches?.[0]?.clientY || 0 }
function onTouchMove(e) {
  if (animating.value) return
  const y = e.changedTouches?.[0]?.clientY || 0
  const delta = y - startY.value
  translateY.value = Math.max(0, delta)
}
function onTouchEnd() {
  if (translateY.value > 120) closeCashier()
  else { animating.value = true; translateY.value = 0; setTimeout(()=> animating.value=false, 150) }
}

/** 关闭抽屉 */
function closeCashier () {
  animating.value = true
  translateY.value = closeDistance
  setTimeout(() => {
    cashierVisible.value = false
    animating.value = false
    translateY.value = 0
  }, 180)
}

/** 取消按钮：带确认提示 */
function onCancelPay(){
  uni.showModal({
    title: '提示',
    content: '确认取消支付？',
    cancelText: '继续支付',
    confirmText: '取消',
    success: ({ confirm }) => {
      if (!confirm) return
      onCashierFail({ code: 'USER_CANCEL' })
      uni.showToast({ title: '您已取消支付', icon: 'none' })
      closeCashier()
    }
  })
}

/** 成功：刷新钱包与套餐，跳到套餐Tab并展开 */
function onCashierSuccess () {
  closeCashier()
  availOpen.value = true
  activeTab.value = 'package'
  loadWallet()
  getMyPackages({ effectiveOnly: true }).then(res => {
    availablePackages.value = (res.data || []).map(mapMyPackageToCard)
  })
  getBenefitCandidates({ excludeOwned: true }).then(res => {
    buyablePackages.value = (res.data || []).map(mapPkgToCard)
  })
  uni.showToast({ title: '购买成功', icon: 'success' })
}

/** 失败/取消/异常的统一提示（与 pay.vue 语义一致） */
function onCashierFail (e = {}) {
  const code = e?.code || 'UNKNOWN'
  const msg =
    code === 'USER_CANCEL'     ? '您已取消支付' :
    code === 'NETWORK_OFFLINE' ? '网络不可用，请检查后重试' :
    code === 'PAY_TIMEOUT'     ? '支付超时，请重试' :
    e?.message || '支付未完成或已取消'
  uni.showToast({ title: msg, icon: 'none' })
  // 这些场景自动关闭
  if (code === 'USER_CANCEL' || code === 'NETWORK_OFFLINE' || code === 'UNKNOWN') {
    closeCashier()
  }
}

/** 统计：Tab 只显示“可用数量” */
const couponCount = computed(() =>
  couponList.value.filter(c => c.status === 'available').length
)
const packageCount = computed(() => availablePackages.value.length)

/** 导航 */
function onBack () { uni.navigateBack({ delta: 1 }) }
function goWithdraw () {
  uni.navigateTo({
    url: '/pkg-wallet/pages/wallet/wallet',
    success: () => console.log('[nav] withdraw -> success'),
    fail: e => { console.error('[nav] withdraw -> fail', e); uni.showToast({ title: '页面路径错误或未注册', icon: 'none' }) }
  })
}
function goRecharge () {
  uni.navigateTo({
    url: '/pkg-wallet/pages/wallet/wallet',
    success: () => console.log('[nav] recharge -> success'),
    fail: e => { console.error('[nav] recharge -> fail', e); uni.showToast({ title: '页面路径错误或未注册', icon: 'none' }) }
  })
}

/** 优惠券交互 */
function onShowRule (item) { ruleTitle.value = '使用规则'; ruleContent.value = item.rule || '规则内容'; ruleVisible.value = true }
function onUseCoupon (item) {
  if (!carId.value) {
    uni.showToast({ title: '请选择车辆后再使用优惠券', icon: 'none' })
    uni.navigateTo({ url: `/pkg-biz/pages/find/find?carModels=${item.carModelIds || ''}` })
    return
  }
  uni.$emit('selectCoupon', { couponId: item.id, name: item.title, discountAmount: item.discountAmount || 0, carModelIds: item.carModelIds })
  uni.setStorageSync('tempCoupon', { couponId: item.id, name: item.title, discountAmount: item.discountAmount || 0, carModelIds: item.carModelIds })
  uni.navigateBack()
}
function onShare (item) {}
function onShowPkgRule (item) { ruleTitle.value = '套餐说明'; ruleContent.value = item.rule || '套餐说明内容'; ruleVisible.value = true }
function onUsePackage (item) {
  if (!carId.value) {
    uni.showToast({ title: '请选择车辆后再使用套餐', icon: 'none' })
    uni.navigateTo({ url: `/pkg-biz/pages/find/find?carModels=${item.carModelIds || ''}` })
    return
  }
  uni.$emit('selectCombo', { comboId: item.id, name: item.title, price: item.price, saveAmount: item.saveAmount || 0, carModelIds: item.carModelIds })
  uni.setStorageSync('tempCombo', { comboId: item.id, name: item.title, price: item.price, saveAmount: item.saveAmount || 0, carModelIds: item.carModelIds })
  uni.navigateBack()
}
function onSharePackage (item) { giftUserPackage(item.id, 'friendUserId') }

/** 购买按钮：把 packageId 一起传给收银台 */
function onBuyPackage (item) {
  const pkgId = Number(String(item.id).replace(/^p/i, ''))
  openCashier({
    amount: item.price,
    orderNum: item.id,  // 'p12'
    packageId: pkgId    // ★ 关键
  })
}

/*----------------- 映射函数------------------- */
/** 把 BenefitPackage -> PackageCard */
function mapPkgToCard (pkg) {
  return {
    id: `p${pkg.id}`,
    price: pkg.price,
    title: pkg.packageName,
    subTitle: getCarTypeDescription(pkg.carTypeLimit),
    description: pkg.description,
    expireText: getExpireText(pkg),
    rule: pkg.description,
    carModelIds: pickCarModelIds(pkg)
  }
}

/** 把 UserPackage -> PackageCard（可用套餐） */
function mapMyPackageToCard (up) {
  return {
    id: `up${up.id}`,                 // 注意：这是“用户持有记录”的ID
    title: up.packageName,
    price: up.pricePaid || 0,
    subTitle: '已购买',
    description: '',
    expireText: up.expireTime ? `${new Date(up.expireTime).toLocaleString()}到期` : '无固定期限',
    rule: '',
    carModelIds: pickCarModelIds(up),
    primaryBtn: { text: '立即使用' },
    secondaryBtn: { text: '送给好友' }
  }
}

/** -------- 数据转换/工具 -------- */
const transformPackages = (apiData) => {
  const available = []; const buyable = []
  apiData.forEach(pkg => {
    const t = {
      id: `p${pkg.id}`,
      price: pkg.price,
      title: pkg.packageName,
      subTitle: getCarTypeDescription(pkg.carTypeLimit),
      description: pkg.description,
      expireText: getExpireText(pkg),
      rule: pkg.description,
      carModelIds: pkg.carTypeLimit
    }
    if (pkg.price === 0) available.push(t); else buyable.push(t)
  })
  return { available, buyable }
}
const getExpireText = (pkg) => {
  if (pkg.endTime) return `${new Date(pkg.endTime).toLocaleString()}到期`
  if (pkg.valid)   return `${pkg.valid}天有效`
  if (pkg.packageName?.includes('周末')) return '当周周末有效'
  return '无固定期限'
}
const getCarTypeDescription = (carTypeLimit) => {
  if (!carTypeLimit) return '所有车型通用'
  const types = String(carTypeLimit || '')
    .split(',')
    .map(t => (t === '2' ? '二座' : t === '3' ? '三座' : t === '5' ? '五座' : ''))
    .filter(Boolean)
    .join('/')
  return types ? `限${types}车可用` : '所有车型通用'
}
function formatDate (s) { const d = new Date(s); const p = n => String(n).padStart(2,'0'); return `${d.getFullYear()}.${p(d.getMonth()+1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}到期` }
function getSubTitle (item) {
  if (item.carModelIds) {
    const modelIds = String(item.carModelIds).split(',')
    return `限${getCarModelText(modelIds)}可用`
  }
  return '所有车型通用'
}
function getCtaText (item) {
  if (item.isUsed) return '已使用'
  if (new Date(item.invalidTime) < new Date()) return '已过期'
  return '立即使用'
}
function getStatus (item) {
  const now = new Date(); const exp = new Date(item.invalidTime)
  if (item.isUsed) return 'used'
  if (exp < now)   return 'expired'
  if (item.valid === false) return 'disabled'
  return 'available'
}
function getCarModelText (ids) {
  const map = { '1':'一座车','2':'二座车','3':'三座车','4':'四座车','5':'五座车','6':'六座车','7':'七座车' }
  return ids.map(id => map[id] || '未知车型').join('、')
}
function pickCarModelIds(x) {
  const raw = x?.carModelIds ?? x?.carTypeLimit ?? x?.package?.carTypeLimit ?? ''
  if (raw == null) return ''
  if (Array.isArray(raw)) return raw.map(String).join(',')
  return String(raw).trim()
}

/** 生命周期 */
onLoad(options => {
  const { carId: passedCarId, isPayment, defaultTab: qDefaultTab } = options || {}
  carId.value = passedCarId || uni.getStorageSync('carId') || null
  uni.setStorageSync('tempOrderParams', {
    carId: Number(carId.value || 0),
    isPayment: isPayment === 'true'
  })
  // 优先级：prop > 路由query > 默认 'coupon'
  activeTab.value = props.defaultTab || qDefaultTab || 'coupon'
})
onShow(() => {
  // 建议在这里从用户态拿真实 userId
  currentUserId.value = Number(uni.getStorageSync('userId') || 0)
  loadWallet()
})

/** 动态隐藏：页面离开时自动关闭 */
onHide(() => { if (cashierVisible.value) closeCashier() })
onUnload(() => { if (cashierVisible.value) closeCashier() })

/** 动态隐藏：网络断开时自动关闭并提示 */
const online = ref(true)
uni.getNetworkType?.({ success: (r) => { online.value = r.networkType !== 'none' } })
uni.onNetworkStatusChange?.((r) => { online.value = !!r.isConnected })
watch(online, (ok) => {
  if (!ok && cashierVisible.value) {
    onCashierFail({ code:'NETWORK_OFFLINE' })
    uni.showToast({ title:'网络不可用，请检查后重试', icon:'none' })
    closeCashier()
  }
})

onMounted(() => {
  getMyCoupons().then(response => {
    couponList.value = (response.data || []).map(item => ({
      id: item.id,
      amount: item.content,
      thresholdText: `满${item.useCondition}元可用`,
      rule: item.rule,
      title: item.name,
      subTitle: getSubTitle(item),
      expireText: formatDate(item.invalidTime),
      ctaText: getCtaText(item),
      status: getStatus(item),
      shareable: item.source === '注册奖励',
      carModelIds: item.carModelIds
    }))
  })

  getMyPackages({ effectiveOnly: true }).then(res => {
    availablePackages.value = (res.data || []).map(mapMyPackageToCard)
  })
  getBenefitCandidates({ excludeOwned: true }).then(res => {
    buyablePackages.value = (res.data || []).map(mapPkgToCard)
  })

  loadWallet()
})
</script>

<style scoped>
.index-root { display:block; }

.header { height: 290rpx; width: 750rpx; background: linear-gradient(180deg,#F66600 0%,#FD9A3D 100%); color:#fff; padding-top: env(safe-area-inset-top); position: relative; }
.tabs-on-header { position: absolute; left: 0; right: 0; bottom: 8rpx; }
.page { min-height: 100vh; background: #F5F6F9; padding: 0rpx 20rpx 16rpx; box-sizing: border-box; }

.pkg-section-head { display:flex; align-items:center; justify-content:space-between; padding:14rpx 4rpx 2rpx; }
.pkg-section-title {
  flex: 0 1 auto; max-width: 70%;
  font-size:28rpx; color:#444; white-space: nowrap;
  overflow:hidden; text-overflow:ellipsis;
}
.pkg-fold { width:40rpx; transition: transform .18s ease; }
.pkg-fold.open { transform: rotate(180deg); }

.cashier-root{ position: fixed; inset: 0; z-index: 999; }
.cashier-root.hidden { pointer-events: none; }
.cashier-mask{
  position: absolute; inset: 0; background: rgba(0,0,0,.45);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  animation: maskIn .18s ease-out;
}
@keyframes maskIn { from{ opacity:.2 } to{ opacity:1 } }
.cashier-root.closing .cashier-mask{ animation: maskOut .18s ease-in forwards; }
@keyframes maskOut { from{ opacity:1 } to{ opacity:0 } }

.cashier-sheet{
  position: absolute; left:0; right:0; bottom:0; background:#fff;
  border-top-left-radius:24rpx; border-top-right-radius:24rpx;
  box-shadow: 0 -12rpx 32rpx rgba(0,0,0,.08);
  max-height: 78vh; overflow: hidden;
  transform: translateY(16%); animation: slideUp .2s ease-out forwards;
}
@keyframes slideUp { from { transform: translateY(16%) } to { transform: translateY(0) } }
.sheet-grip{ width: 88rpx; height: 8rpx; border-radius: 8rpx; background: #E7E9ED; margin: 16rpx auto 10rpx; }
.sheet-header{
  display:flex; align-items:center; justify-content:center;
  position:relative; height:88rpx; border-bottom:1rpx solid #F1F2F5;
}
.sheet-header .title{ font-size:30rpx; font-weight:600; color:#222; }
.sheet-header .close{ position:absolute; right:24rpx; top:0; bottom:0; display:flex; align-items:center; font-size:40rpx; color:#999; }
.sheet-body{
  max-height: calc(78vh - 88rpx - 24rpx);
  padding: 8rpx 24rpx 0; box-sizing: border-box;
  -webkit-overflow-scrolling: touch; overflow-y: auto;
}
.safe-bottom{ height: calc(16rpx + env(safe-area-inset-bottom)); }

.btn-cancel{
  width: 688rpx; height: 88rpx; margin: 8rpx auto 24rpx;
  background:#F6F7F9; color:#333; border:none; border-radius:44rpx;
}
.btn-cancel::after{ border: none !important; }
</style>
