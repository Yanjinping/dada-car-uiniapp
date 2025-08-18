<template>
  <view class="wallet-card">
    <!-- 顶部一行：标题 +（收起时）总余额 + 箭头 -->
 <view class="bar" @tap="toggle()">
   <view class="bar-left">
     <image class="ico" src="/static/benefit/wallet.png" mode="widthFix" />
     <text class="title">嗒嗒钱包</text>
     <transition name="fade-slim">
       <text v-if="!innerExpanded" class="amount">{{ spendable }}</text>
     </transition>
   </view>
   <image
     class="arrow"
     :class="{ up: innerExpanded }"
     src="/static/icons/arrow-down.png"
     mode="widthFix"
   />
 </view>
 
    <!-- 展开内容 -->
    <transition name="fade">
      <view v-if="innerExpanded" class="panel">
        <view class="grid">
          <view class="cell">
            <view class="val">
              <text class="yen">￥</text><text class="num">{{ spendable.replace('¥','').trim() }}</text>
            </view>
            <view class="lab">可消费</view>
          </view>
    
          <view class="cell">
            <view class="val">
              <text class="yen">￥</text><text class="num">{{ withdrawable.replace('¥','').trim() }}</text>
            </view>
            <view class="lab">可提现</view>
          </view>
    
          <view class="cell muted">
            <view class="val">
              <text class="yen">￥</text><text class="num">{{ String(depositCar).replace('¥','').trim() }}</text>
            </view>
            <view class="lab">
              车辆押金 <text class="sub">（使用中）</text>
            </view>
          </view>
    
          <view class="cell muted">
            <view class="val">
              <text class="yen">￥</text><text class="num">{{ String(depositIllegal).replace('¥','').trim() }}</text>
            </view>
            <view class="lab">
              违章押金 <text class="sub">（冻结中）</text>
            </view>
          </view>
        </view>
    
        <view class="btns">
          <button class="btn outline">提现</button>
          <button class="btn dark">充值</button>
        </view>
      </view>
    </transition>

	
	
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  expanded: { type: Boolean, default: false },     // v-model:expanded
  spendable: { type: String, default: '¥ 0.00' },
  withdrawable: { type: String, default: '¥ 0.00' },
  depositCar: { type: String, default: '¥ 0' },
  depositIllegal: { type: String, default: '¥ 0' }
})
const emit = defineEmits(['update:expanded', 'withdraw', 'recharge'])

const innerExpanded = computed({
  get: () => !!props.expanded,
  set: v => emit('update:expanded', v)
})

function toggle(){ innerExpanded.value = !innerExpanded.value }
</script>

<style scoped>
.wallet-card{
                /* 如需不贴边可改为 0 */
  background: #FFF1DA;            /* 可换成 var(--wallet-bg) */
  border-radius: 24rpx;
  padding: 12rpx 16rpx 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(0,0,0,0.06);
  
}

/* 顶部条：收起/展开都显示 */
.bar {
  display: flex;
  align-items: center;          /* 垂直居中 */
  justify-content: space-between; /* 左右两端对齐 */
  height: 72rpx;
}
.bar-left {
  display: flex;
  align-items: center;          /* 左边文字和图标垂直居中 */
  gap: 12rpx;
}
.ico{ width: 48rpx; }

.title {
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 540;
  font-size: 32rpx;
  color: #BC7F03;
  line-height: 40rpx;
  letter-spacing: 1rpx; 
}

/* 金额（仅收起态显示） */
.amount {
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 600;
  font-size: 26rpx;
  color: #BC7F03;
}

/* 箭头在最右侧 */
.arrow {
  width: 40rpx;
  height: 40rpx;
  flex-shrink: 0;
    display: block;              /* 避免 inline-block 的基线偏移 */
    margin: auto 0;              /* 保证垂直居中 */
  transition: transform 0.2s ease;
}
.arrow.up {
  transform: rotate(180deg);
}

/* 展开面板容器 */
.panel{ padding-top: 12rpx; }

/* 4 等分栅格，居中对齐 */
.grid{
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12rpx 0;
  padding: 8rpx 4rpx 0;
  text-align: center;
}

/* 上面金额一行 */
.val{
  height: 52rpx;                      /* 对齐设计行高 */
  line-height: 52rpx;
  display: inline-flex;
  align-items: flex-start;            /* 数字顶对齐视觉更稳 */
  justify-content: center;
  color: #894420;                     /* 设计主色 */
}

/* ￥ 与数字分字体和大小 */
.yen{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 400;
  font-size: 26rpx;                   /* 26rpx */
  line-height: 52rpx;
  margin-right: 4rpx;
}
.num{
  /* 如果有 D-DIN 就用，没有就走系统字体 */
  font-family: "D-DIN-Bold","DIN Alternate","Arial Narrow",AlibabaPuHuiTi,sans-serif;
  font-weight: 700;                   /* 粗 */
  font-size: 48rpx;                   /* 48rpx */
  line-height: 52rpx;
}

/* 第3、4列 40% 透明（数字和符号一起） */
.cell.muted .val{ color: rgba(137,68,32,0.4); }

/* 下面标签一行 */
.lab{
  margin-top: 6rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 400;
  font-size: 28rpx;                   /* 28rpx */
  line-height: 36rpx;                 /* 36rpx */
  color: #222222;
  text-align: center;
}
.sub{ 
	display: block;            /* 换行 */
  margin-left: 0;
  margin-top: 2rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #888888; }

/* 按钮区域：对版 328×96 / 圆角 24 / 描边 2rpx */
.btns{ display:flex; gap: 30rpx; margin-top: 18rpx; padding: 0 16rpx; }
.btn{
  width: 328rpx;
  height: 96rpx;
  border-radius: 24rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-size: 36rpx;
  line-height: 50rpx;
  display:flex; align-items:center; justify-content:center;
}
.outline{
   background: transparent;        /* 纯白底 */
   border: 2rpx solid #BC7F03; /* 描边用主题色 */
   color: #BC7F03;             /* 文案同主题色 */
}
.dark{
  background:#333333;
  color:#FAC263;
  border: none;
}


/* 动画 */
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-slim-enter-active, .fade-slim-leave-active { transition: opacity .12s linear; }
.fade-slim-enter-from, .fade-slim-leave-to { opacity: 0; }
</style>
