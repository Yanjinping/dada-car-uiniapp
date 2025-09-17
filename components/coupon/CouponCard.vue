<template>
  <view class="card" :class="[`status-${status}`]">
    <!-- 主体 -->
    <view class="main">
      <!-- 左侧金额块 -->
      <view class="left">
        <view class="price">
          <text class="currency">￥</text>
          <text class="amount">{{ amount }}</text>
        </view>
        <text class="threshold">{{ thresholdText }}</text>
      </view>

      <!-- 细竖线 -->
      <view class="vline" />

      <!-- 中间信息区（右侧整体 info-right 控制 1/2/3 的布局与靠右） -->
      <view class="mid">
        <view class="info-right">
          <view class="title ellipsis">{{ title }}</view>
          <view v-if="subComputed" class="sub ellipsis">{{ subComputed }}</view>
      
          <view v-if="expireDateOnly" class="expire-pill">
            <text class="expire-date">{{ expireDateOnly }}</text>
            <text class="expire-suffix">到期</text>
          </view>
      
          <image
            class="car"
            :src="carSrc || defaultCar"
            mode="widthFix"
          />
          <view class="car-grad"></view>
      
          <button class="rule-btn" @tap="$emit('rule')">使用规则</button>
        </view>
      </view>

    </view>

    <!-- 虚线分割 -->
    <view class="dash"></view>

    <!-- 底部按钮：有副按钮=双按钮；没有=整行大按钮 -->
    <view class="btns" :class="{ single: !secondaryBtn?.visible }">
      <button
        v-if="secondaryBtn?.visible"
        class="btn secondary"
        @tap="$emit('tap-secondaryBtn')"
      >
        {{ secondaryBtn.text || '送给好友' }}
      </button>

      <button
        class="btn primary"
        :disabled="status !== 'available'"
        @tap="$emit('cta')"
      >
        {{ ctaText }}
      </button>
    </view>

    <view v-if="statusTip" class="mask-tip">{{ statusTip }}</view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  amount: { type: [Number, String], required: true },
  thresholdText: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  subTitle: { type: String, default: '' },
  expireDate: { type: String, default: '' },
  expireText: { type: String, default: '' },
  carImage: { type: String, default: '' },
  suffixIcon: { type: String, default: '' },
  status: { type: String, default: 'available' },
  statusTip: { type: String, default: '' },
  ctaText: { type: String, default: '立即使用' },
  secondaryBtn: { type: Object, default: null }
})

const subComputed = computed(() => props.subTitle || props.subtitle || '')

/** 右侧车图（可传 carImage/suffixIcon），默认使用本地淡灰图 */
const defaultCar = '/static/icons/che-bg.png'
const carSrc = computed(() => props.carImage || props.suffixIcon || '')

/** 统一“到期时间”展示为一行：去掉“到期”，清理换行/多空格 */
const expireDateOnly = computed(() => {
  const raw = props.expireDate || props.expireText || ''
  return raw
    .replace(/到期/g, '')
    .replace(/\s+/g, ' ')
    .trim()
})
</script>

<style scoped>
/* ===== 卡片容器 ===== */
.card{
  margin: 12rpx 0;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx;
  position: relative;
  box-sizing: border-box;
}

/* ===== 主体横排 ===== */
.main{ display:flex; align-items:center; }

/* 左侧金额区（180×180） */
.left{
  width: 180rpx; min-height: 180rpx;
  display:flex; flex-direction:column; justify-content:flex-start;
  padding-left: 18rpx; box-sizing:border-box;
}
.price{ display:flex; align-items:flex-end; gap:6rpx; margin-top:8rpx; }
.currency{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 500; font-size: 32rpx; line-height: 44rpx; color:#FF7009;
  padding-bottom: 6rpx;              /* 让￥落在数字左下 */
}
.amount{
  font-family: "D-DIN-Bold","DIN Alternate","Arial Narrow",AlibabaPuHuiTi,sans-serif;
  font-weight:700; font-size:80rpx; line-height:88rpx; color:#FF7009;
}
.threshold{
  margin-top:8rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight:400; font-size:22rpx; line-height:30rpx; color:#FF7009; text-align:left;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 左块右侧竖线 */
.vline{
  width:0; height:120rpx; border-left:2rpx solid #EFEFEF;
  margin:0 16rpx 0 8rpx; opacity:.9;
}

/* 中间信息区 */
.mid{ flex:1; padding:0 16rpx; box-sizing:border-box; }

/* 右侧一组：标题 + 到期，在左；车与规则在右。整体更靠右 */
.info-right{
  width: 500rpx;          /* 组宽度：可按视觉调整 */
  margin-left: auto;      /* 让这一组贴右 */
  position: relative;     /* 为车图/规则按钮提供定位上下文 */
  padding-right: 180rpx;  /* 右边给车图留位（154rpx + 余量） */
  box-sizing: border-box;
}

/* 1 名称（不换行，过长省略） */
.title{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 500; font-size: 32rpx; line-height: 44rpx; color:#222222;
}
.ellipsis{ white-space: nowrap;  }

/* 副标题（限四座车可用 等） */
.sub{
  margin-top:6rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight:400; font-size:24rpx; line-height:32rpx; color:#888888;
}

/* 2 到期 pill：紧贴标题/副标题下方 */
.expire-pill{
  margin-top: 10rpx;
  display:inline-flex; align-items:center; white-space:nowrap;
  padding:8rpx 16rpx; background:#FFF3E1; border-radius:8rpx;
}
.expire-date{
  font-family: Inter, sans-serif;
  font-weight:400; font-size:24rpx; line-height:40rpx; color:#FFA24A;
}
.expire-suffix{
  margin-left:6rpx; font-family: AlibabaPuHuiTi, sans-serif;
  font-weight:400; font-size:26rpx; line-height:40rpx; color:#FFA24A;
}

/* 车图：绝对定位在 info-right 右侧 */
.car{
  position:absolute;
  right: 48rpx;               /* 贴右 */
  top:   24rpx;            /* 贴标题上沿略下，按视觉微调 */
  width:148rpx; height:148rpx;
  display:block;
  z-index: 1; 
}

/* 灰色渐变罩（蓝湖“路径”层） */
.car-grad{
  position:absolute; left:calc(100% - 154rpx); top:20rpx;
  width:148rpx; height:116rpx; pointer-events:none;
   z-index: 0; 
}

/* 3 使用规则：叠在车图上，偏下面；96×40 胶囊，Inter 24 */
.rule-btn{
  position:absolute;
  right: 40rpx;          /* 更靠右或靠左就调它 */
  bottom:0rpx;          /* “在 2 的上面偏下面” -> 位于车图中下部 */
  z-index: 3;
  margin-right: 20rpx;
  width: 110rpx;
  height: 40rpx;
  border-radius: 10rpx;

  display:inline-flex; align-items:center; justify-content:center;
  font-family: Inter, sans-serif;
  font-weight:400; font-size:24rpx; color:#666666; line-height:40rpx;
  white-space: nowrap; text-align: left;

  /* 胶囊浅灰背景（与蓝湖一致） */
background-image: url('/static/icons/che-bg.png'); /* ← 你的切图路径 */
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;  /* 需要再“往下一点”可改成：center 6rpx 等 */
}

/* 虚线分割线 */
.dash{ height:0; margin:20rpx 0; border-top:2rpx dashed #DDDDDD; }

/* ===== 底部按钮 ===== */
.btns{ display:flex; gap:20rpx; }

/* 双按钮：左 240×96（描边），右 390×96（渐变） */
.btn{
  height:96rpx; border-radius:48rpx;
  font-family: AlibabaPuHuiTi, sans-serif; font-size:36rpx; line-height:50rpx;
  display:flex; align-items:center; justify-content:center; box-sizing:border-box;
}
.btn.secondary{ width:240rpx; background:#fff; border:2rpx solid #FFA24A; color:#FFA24A; }
.btn.primary{ width:390rpx; background:linear-gradient(316deg,#F3A03A 0%,#FFC868 100%); color:#fff; }
.btn.primary:disabled{ opacity:.5 }

/* 单按钮（没有 secondaryBtn 时）：整行 650×96、圆角 48、渐变 */
.btns.single .btn.primary{
  width:650rpx; height:96rpx; border-radius:48rpx;
  background: linear-gradient(316deg, #F3A03A 0%, #FFC868 100%);
  color:#fff;
}

/* 状态弱化（可选） */
.status-used, .status-expired{ opacity:.6; }
.mask-tip{
  position:absolute; right:24rpx; top:24rpx; background:rgba(0,0,0,.55);
  color:#fff; padding:8rpx 12rpx; border-radius:8rpx; font-size:22rpx;
}
</style>
