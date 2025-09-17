<template>
  <scroll-view scroll-y class="page">
    <!-- 顶部背景（支持切图或渐变） -->
    <view class="top-bg" />

    <!-- 顶部栏 -->
 <!-- 顶部导航（自定义） -->
 <TitleBar title="个人中心" background="#FFFFFF">
     <!-- 右侧可放占位或图标 -->
     <!-- <image src="/static/xxx.png" style="width:40rpx;height:40rpx" /> -->
   </TitleBar>
   
    <!-- 悬浮客服（可拖动） -->
    <view
      class="float-service"
      :style="{left: servicePos.x + 'rpx', top: servicePos.y + 'rpx'}"
      @touchstart.stop="dragStart"
      @touchmove.stop.prevent="dragMove"
      @touchend.stop="dragEnd"
      @touchcancel.stop="dragEnd"
      @mousedown.stop="mouseStart"
      @click="goService"
    >
      <image :src="service.avatar" mode="aspectFill" draggable="false" />
    </view>

    <!-- 内容容器 -->
    <view class="container">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <image class="avatar" :src="user.avatar" mode="aspectFill" />
        <view class="meta">
          <view class="row name-row">
            <text class="name">{{ user.nickname }}</text>
            <text class="tag">{{ user.levelTag }}</text>
          </view>
          <text class="phone">{{ user.phoneMasked }}</text>
        </view>
      </view>

      <!-- 钱包卡片 -->
      <view class="wallet-card" @click="goWallet">
        <view class="wallet-hd">
          <view class="wallet-title">
            <image class="wallet-ico" src="/static/profile/wallet.png" mode="widthFix"/>
            <text class="wallet-text">嗒嗒钱包</text>
          </view>
          <image class="arrow-ico" src="/static/profile/chevron-right-w.png" mode="widthFix" @click.stop="goWallet"/>
        </view>
        <view class="wallet-bd">
          <view class="money"><text class="yen">¥</text>{{ wallet.balance }}</view>
          <view class="recharge" @click.stop="goRecharge">充值</view>
        </view>
        <view class="promo">充值福利大爆发！充100送30， 充200送70， 充300送120</view>
      </view>

      <!-- 套餐 / 优惠券 两列卡片（右侧装饰icon） -->
      <view class="two-col">
        <view class="col" @click="goPackages">
          <view class="line1">
            <image class="ico" src="/static/profile/package.png" mode="widthFix"/>
            <text class="title">套餐</text>
          </view>
          <text class="desc">购买套餐更划算哦~</text>
        </view>
        <view class="divider" />
        <view class="col" @click="goCoupons">
          <view class="line1">
            <image class="ico" src="/static/profile/coupon.png" mode="widthFix"/>
            <text class="title">优惠券</text>
          </view>
          <text class="desc">{{ couponSummary }}</text>
        </view>
      </view>

      <!-- 常用功能 -->
      <view class="func-grid">
        <view class="func-title">常用功能</view>
        <view class="grid">
          <view v-for="(item,idx) in functionItems" :key="idx" class="cell" @click="onCellTap(item)">
            <view class="badge" v-if="item.badge" :class="item.badgePos || 'tl'">{{ item.badge }}</view>
            <image class="ico" :src="`/static/profile/${item.icon}.png`" mode="widthFix" />
            <text class="txt">{{ item.title }}</text>
          </view>
        </view>
      </view>

      <!-- 列表链接 -->
      <view class="link-list">
        <view class="item" v-for="(item, i) in profileLinks" :key="i" @click="onLinkTap(item)">
          <text class="tit">{{ item.title }}</text>
          <text class="ext" v-if="item.extra">{{ item.extra }}</text>
          <text class="chev">›</text>
        </view>
      </view>

      <!-- 客服电话 -->
      <view class="footer">客服电话：400-6666-589(8:30~22:00)</view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeUnmount } from 'vue'
import TitleBar from '@/components/header/TitleBar.vue'

// ===== Mock 数据（可替换为真实接口） =====
const user = reactive({
  avatar: '/static/demo/avatar.png',
  nickname: '青蛙',
  levelTag: '萌新小白',
  phoneMasked: '186****4170'
})

const service = reactive({ avatar: '/static/profile/kefu-icon.png' })
const wallet = reactive({ balance: '0.00' })
const couponSummary = '10张优惠券可用'

const functionItems = reactive([
  { title: '我的订单', icon: 'order', onTap: 'goOrders' },
  { title: '押金管理', icon: 'deposit', onTap: 'goDeposit' },
  { title: '违章查询', icon: 'violation', badge: '待处理', badgePos: 'tr', onTap: 'goViolation' },
  { title: '认证信息', icon: 'auth', badge: '未认证', badgePos: 'tl', onTap: 'goAuthInfo' },
  { title: '我的积分', icon: 'jifen', onTap: 'goShareGift' },
  { title: '嗒嗒新零售', icon: 'ershouche', onTap: 'goCommunity' }
])

const profileLinks = reactive([
  { title: '学生认证', onTap: 'goStudentVerify' },
  { title: '用车手册', onTap: 'goManual' },
  { title: '用户协议', onTap: 'goAgreement' },
  { title: '退出登录', onTap: 'logout' }
])

// ===== 交互占位（带路由实现） =====
const PHONE = '400-6666-589'
const NAV = {
  login: '/pages/login/index',
  wallet: '/pkg-wallet/pages/wallet/wallet',
  pay: '/pkg-order/pages/pay/pay',
  packages: '/pkg-benefit/pages/coupon/index?defaultTab=combo',
  coupons: '/pkg-benefit/pages/coupon/index?defaultTab=coupon',
  orders: '/pkg-order/pages/order/list',
  deposit: '/pkg-wallet/pages/deposit/deposit?tab=deposit',
  violation: '/pages/map/index?tab=violation', // 没有独立违章页时临时放 map
  auth: '/pkg-auth/pages/auth/idcard',
  share: '/pages/order/ShareOrder',
  community: '/pkg-benefitpages/promo/index',
  points: '/pages/points/index'
}

const safeGo = (url:string) => uni.navigateTo({ url })

const onBack = () => uni.navigateBack()
const onMore = () => {
  uni.showActionSheet({
    itemList: ['联系客服', '学生认证', '退出登录'],
    success: (res) => {
      const i = res.tapIndex
      if (i === 0) uni.makePhoneCall({ phoneNumber: PHONE })
      if (i === 1) safeGo(NAV.auth)
      if (i === 2) logout()
    }
  })
}
const onScan = () => {
  uni.scanCode({
    onlyFromCamera: true,
    success: ({ result }) => {
      // 你可以按业务解析 result，比如跳转到订单页或活动页
      try { const url = decodeURIComponent(result || ''); if(url.startsWith('/pages/')) safeGo(url) } catch(_) {}
    }
  })
}
const goService = () => uni.makePhoneCall({ phoneNumber: PHONE })
const goRecharge = () => safeGo(NAV.wallet)
const goWallet = () => safeGo(NAV.wallet)
const goPackages = () => safeGo(NAV.packages)
const goCoupons = () => safeGo(NAV.coupons)

const onCellTap = (it:any) => {
  switch(it?.onTap){
    case 'goOrders':      safeGo(NAV.orders); break
    case 'goDeposit':     safeGo(NAV.deposit); break
    case 'goViolation':   safeGo(NAV.violation); break
    case 'goAuthInfo':    safeGo(NAV.auth); break
    case 'goShareGift':   uni.showToast({ title:'开发中', icon:'none' }); break
    case 'goCommunity':   uni.showToast({ title:'开发中', icon:'none' }); break
    default: uni.showToast({ title:'开发中', icon:'none' })
  }
}
const onLinkTap = (it:any) => {
  switch(it?.onTap){
    case 'goStudentVerify': safeGo(NAV.auth + '?type=student'); break
    case 'goManual':        uni.showToast({ title:'用车手册暂未上线', icon:'none' }); break
    case 'goAgreement':     uni.showToast({ title:'用户协议暂未上线', icon:'none' }); break
    case 'logout':          logout(); break
    default:                uni.showToast({ title:'开发中', icon:'none' })
  }
}
function logout(){
  try{ uni.clearStorageSync() }catch(_){ }
  uni.reLaunch({ url: NAV.login })
}

// ===== 悬浮客服拖拽 =====
const servicePos = reactive({ x: 620, y: 220 }) // rpx 初始位置
const start = reactive({ x: 0, y: 0 })
function dragStart(e:any){ const t = e.touches?.[0]; start.x = t.pageX; start.y = t.pageY }
function dragMove(e:any){
  const t = e.touches?.[0]
  const dx = t.pageX - start.x
  const dy = t.pageY - start.y
  const sys = uni.getSystemInfoSync(); const rpxPerPx = 750 / sys.windowWidth
  servicePos.x += dx * rpxPerPx; servicePos.y += dy * rpxPerPx
  start.x = t.pageX; start.y = t.pageY
}
const BTN_SIZE_RPX = 88;           // 按你的客服按钮尺寸（与 .float-service image 宽高一致）
const EDGE_MARGIN_RPX = 16;         // 吸边后与边缘的间距
function clamp(v:number, min:number, max:number){ return Math.max(min, Math.min(v, max)) }
function dragEnd(){
  const sys = uni.getSystemInfoSync()
  const rpxPerPx = 750 / sys.windowWidth
  const pageHeightRpx = sys.windowHeight * rpxPerPx
  const screenWidthRpx = 750
  // 边界限制（不出屏）
  servicePos.x = clamp(servicePos.x, EDGE_MARGIN_RPX, screenWidthRpx - BTN_SIZE_RPX - EDGE_MARGIN_RPX)
  servicePos.y = clamp(servicePos.y, EDGE_MARGIN_RPX, pageHeightRpx - BTN_SIZE_RPX - EDGE_MARGIN_RPX)
  // 左右吸边
  const middle = (screenWidthRpx - BTN_SIZE_RPX) / 2
  servicePos.x = servicePos.x < middle ? EDGE_MARGIN_RPX : (screenWidthRpx - BTN_SIZE_RPX - EDGE_MARGIN_RPX)
}

// ===== H5/PC 鼠标拖拽支持 =====
const draggingMouse = ref(false)
function mouseStart(e:any){
  draggingMouse.value = true
  start.x = e.clientX
  start.y = e.clientY
  window.addEventListener('mousemove', mouseMove)
  window.addEventListener('mouseup', mouseEnd)
}
function mouseMove(e:any){
  if(!draggingMouse.value) return
  const dx = e.clientX - start.x
  const dy = e.clientY - start.y
  const sys = uni.getSystemInfoSync(); const rpxPerPx = 750 / sys.windowWidth
  servicePos.x += dx * rpxPerPx; servicePos.y += dy * rpxPerPx
  start.x = e.clientX; start.y = e.clientY
}
function mouseEnd(){
  draggingMouse.value = false
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', mouseEnd)
  dragEnd()
}
onBeforeUnmount(()=>{
  window.removeEventListener('mousemove', mouseMove)
  window.removeEventListener('mouseup', mouseEnd)
})
</script>

<style scoped lang="scss">
// ===== Design Tokens (全局变量，可与设计稿对齐) =====
$color-bg-page: #F5F6F9;
$color-bg-hero-from: #DFFFF1;
$color-bg-hero-to: #F6F9FF;
$color-brand-1: #1DC46E; // 主绿
$color-brand-2: #3ACD99; // 渐变右侧绿
$color-brand-deep: #12B079;
$color-text-1: #222222;
$color-text-2: #444444;
$color-text-3: #8B96A6;
$color-line: #EEF0F3;
$color-orange: #FFB964;
$color-orange-deep: #B57416;
$color-orange-bg: #FFF3DF;
$radius-8: 8rpx; $radius-16: 16rpx; $radius-20: 20rpx; $radius-24: 24rpx;
$shadow-soft: 0 6rpx 20rpx rgba(0,0,0,.06);
$grad-brand: linear-gradient(180deg, $color-brand-1 0%, $color-brand-2 100%);

.page { min-height: 100vh; background: $color-bg-page; }

/* 顶部大背景：可以换成切图 */
.top-bg { position: absolute; left:0; top:0; right:0; height: 760rpx; z-index: 0;
  background: radial-gradient(120% 120% at 0% 0%, $color-bg-hero-from 0%, #ffffff00 60%),
              radial-gradient(120% 120% at 100% 0%, #E8FFF7 0%, #ffffff00 60%),
              linear-gradient(180deg, #F1FFF6 0%, $color-bg-page 100%);
}
/* 若使用切图，启用下面一行并替换路径 */
/* .top-bg { background: url('/static/profile/bg-hero.png') no-repeat center/cover; } */

.container { position: relative; z-index: 1; padding: 24rpx; }

/* 顶部栏 */
.topbar { position: sticky; top: 0; z-index: 5; height: 112rpx; display: flex; align-items: flex-end; padding: 0 24rpx 16rpx; background: transparent; }
.topbar .left { width: 96rpx; height: 64rpx; display: flex; align-items: center; }
.topbar .icon { font-size: 56rpx; color: #222; line-height: 64rpx; }
.topbar .title { flex: 1; text-align: center; font-size: 40rpx; line-height: 54rpx; font-weight: 700; color: $color-text-1; }
.topbar .right { width: 160rpx; display: flex; justify-content: flex-end; gap: 24rpx; align-items: center; }
.topbar .more, .topbar .scan { width: 72rpx; height: 56rpx; text-align: center; line-height: 56rpx; font-size: 44rpx; color: #333; }

/* 悬浮客服：可拖动（仅图片无底圆） */
.float-service { position: fixed; z-index: 10; width: auto; height: auto; background: transparent; box-shadow: none; touch-action: none; -webkit-user-select: none; user-select: none; }
.float-service image { width: 88rpx; height: 88rpx; border-radius: 50%; display: block; -webkit-user-drag: none; user-select: none; }

/* 用户卡 */
.user-card { display: flex; align-items: center; gap: 20rpx; padding: 24rpx; background: transparent; border-radius: $radius-24; box-shadow: none; }
.user-card .avatar { width: 112rpx; height: 112rpx; border-radius: 50%; }
.user-card .meta { flex: 1; display: flex; flex-direction: column; gap: 8rpx; }
.user-card .name-row { display: flex; align-items: center; gap: 12rpx; }
.user-card .name { font-size: 40rpx; font-weight: 700; color: $color-text-1; }
.user-card .tag { font-size: 24rpx; padding: 6rpx 12rpx; border-radius: 20rpx; background: linear-gradient(90deg,#3BEAAC 0%,#9FF4B0 100%); color: #1b6b41; }
.user-card .phone { font-size: 28rpx; color: $color-text-3; }

/* 钱包卡 */
.wallet-card { margin-top: 12rpx; padding: 20rpx 24rpx 18rpx; border-radius: $radius-24; color: #fff; overflow: hidden; background: $grad-brand; }
.wallet-card .wallet-hd { display: flex; align-items: center; justify-content: space-between; min-height: 44rpx; }
.wallet-card .wallet-title { display: flex; align-items: center; gap: 10rpx; }
.wallet-card .wallet-ico { width: 36rpx; }
.wallet-card .wallet-text { font-size: 28rpx; line-height: 44rpx; }
.wallet-card .arrow-ico { width: 18rpx; height: 18rpx; opacity: .98; }
.wallet-card .wallet-bd { margin-top: 14rpx; display: flex; align-items: center; justify-content: flex-start; gap: 16rpx; }
.wallet-card .money { font-size: 56rpx; font-weight: 700; letter-spacing: 1rpx; }
.wallet-card .yen { font-size: 36rpx; margin-right: 4rpx; opacity: .95; }
.wallet-card .recharge { display:inline-flex; align-items:center; justify-content:center; height: 56rpx; padding: 0 24rpx; border-radius: 28rpx; background: $color-orange-bg; color: $color-orange-deep; font-size: 28rpx; box-shadow: 0 6rpx 12rpx rgba(255,185,100,.25); }
.wallet-card .promo { margin-top: 12rpx; font-size: 24rpx; color: #FFF4DC; opacity: .95; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 两列卡（icon在左） */
.two-col { margin-top: 16rpx; display: flex; background: #fff; border-radius: $radius-24; overflow: hidden; }
.two-col .col { flex: 1; padding: 28rpx; }
.two-col .line1 { display: flex; align-items: center; gap: 12rpx; }
.two-col .ico { width: 40rpx; }
.two-col .title { font-size: 32rpx; color: $color-text-1; font-weight: 600; }
.two-col .desc { margin-top: 8rpx; font-size: 24rpx; color: $color-text-3; }
.two-col .divider { width: 2rpx; background: $color-line; }

/* 常用功能 */
.func-grid { margin-top: 16rpx; background: #fff; border-radius: $radius-24; padding: 20rpx 24rpx 8rpx; }
.func-grid .func-title { font-size: 30rpx; font-weight: 700; color: $color-text-1; margin-bottom: 12rpx; }
.func-grid .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12rpx; }
.func-grid .cell { position: relative; padding: 24rpx 0; display: flex; flex-direction: column; align-items: center; gap: 12rpx; }
.func-grid .ico { width: 64rpx; }
.func-grid .txt { font-size: 28rpx; color: $color-text-2; }
.func-grid .badge { position: absolute; min-width: 88rpx; height: 40rpx; padding: 0 12rpx; background: #FF8F63; color: #FFFFFF; font-size: 22rpx; line-height: 40rpx; text-align: center; font-weight: 400; font-family: 'AlibabaPuHuiTi', system-ui, -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; box-shadow: 0 10rpx 18rpx rgba(255,143,99,.35); }
.func-grid .badge.tl { top: -5px; left: 120rpx; border-radius: 24rpx 24rpx 24rpx 0rpx; }
.func-grid .badge.tr { top: 12rpx; right: 0rpx; border-radius: 24rpx 24rpx 24rpx 0rpx; } /* ← 调这里控制右侧距离 */

/* 链接列表 */
.link-list { margin-top: 16rpx; background: #fff; border-radius: $radius-24; overflow: hidden; }
.link-list .item { display: flex; align-items: center; padding: 30rpx 24rpx; border-bottom: 2rpx solid #F1F2F5; }
.link-list .item:last-child { border-bottom: 0; }
.link-list .tit { flex: 1; font-size: 30rpx; color: $color-text-1; }
.link-list .ext { margin-right: 12rpx; font-size: 24rpx; color: $color-text-3; }
.link-list .chev { font-size: 40rpx; color: #C8CDD8; }

/* 页脚 */
.footer { text-align: center; color: #9AA3B2; font-size: 24rpx; margin: 24rpx 0 40rpx; }
</style>
