<template>
  <view class="fee">
    <!-- 省钱横条（与下方卡片拼接） -->
    <view v-if="Number(savingAmount) > 0" class="saving-banner">
      <image class="tc-icon" :src="icons.package" mode="widthFix" />
      <text class="saving-text">
        {{ bannerPrefix }}
        <text class="saving-amt">{{ fmt(savingAmount) }}</text>
        {{ bannerSuffix }}
      </text>
    </view>

    <!-- 单卡片：金额 + 明细 + 元信息 + 展开/收起 -->
    <view class="card">
      <!-- 金额行 -->
      <view class="header">
        <view class="left" @tap="onInfo">
          <text class="title">{{ titleText }}</text>
          <image v-if="showInfo" class="infor" :src="icons.info" mode="widthFix" />
        </view>
        <text class="amt">
          <text class="yen">¥</text>{{ fmt(total) }}
        </text>
      </view>

      <!-- 费用明细行 -->
      <view
        v-for="(r, i) in normalizedRows"
        :key="i"
        class="row"
        :class="{ negative: isNegative(r.v) }"
      >
        <text class="k">{{ r.k }}</text>
        <text class="v">
          <template v-if="isNegative(r.v)">-¥{{ fmtAbs(r.v) }}</template>
          <template v-else>¥{{ fmt(r.v) }}</template>
        </text>
      </view>

      <!-- 使用套餐 / 优惠券（可传入自定义值；未传则显示“无”） -->
      <view class="row strong">
        <text>{{ pkgLabel }}</text>
        <text class="strong-val">{{ packageText || '无' }}</text>
      </view>
      <view class="row strong">
        <text>{{ couponLabel }}</text>
        <text class="strong-val">{{ couponText || '无' }}</text>
      </view>

      <!-- 元信息 -->
      <view v-show="innerExpanded" class="meta">
        <view class="line">
          <text class="label">{{ metaLabels.distance }}</text>
          <text class="value">{{ distanceKm }} km</text>
        </view>
        <view class="line">
          <text class="label">{{ metaLabels.duration }}</text>
          <text class="value">{{ useDuration }}</text>
        </view>
        <view class="line">
          <text class="label">{{ metaLabels.takeTime }}</text>
          <text class="value">{{ takeTime }}</text>
        </view>
        <view class="line">
          <text class="label">{{ metaLabels.takeSite }}</text>
          <text class="value site">{{ takeSite }}</text>
        </view>
        <view class="line">
          <text class="label">{{ metaLabels.backSite }}</text>
          <text class="value site">{{ backSite }}</text>
        </view>
      </view>

      <!-- 展开/收起 -->
      <view v-if="hasMeta" class="more" @tap="toggle">
        <text class="more-text">{{ innerExpanded ? collapseText : expandText }}</text>
        <view class="arrow" :class="{ open: innerExpanded }" />
      </view>
    </view>

    <!-- 计费说明抽屉 -->
    <BillingSheet :visible="showSheet" @close="showSheet=false" />
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BillingSheet from '../../components/return/FeeExplainSheet.vue'

const props = defineProps({
  // 金额与明细
  total: { type: [Number, String], default: 0 },
  rows:  { type: Array, default: () => [] }, // [{k:'时长费', v:28}, {k:'优惠券抵扣', v:-10}]
  packageText: { type: String, default: '' },
  couponText:  { type: String, default: '' },

  // 省钱横条
  savingAmount: { type: [Number, String], default: 10 },
  bannerPrefix: { type: String, default: '套餐已为您节省' },
  bannerSuffix: { type: String, default: '元' },

  // 元信息
  distanceKm:  { type: [Number, String], default: '' },
  useDuration: { type: String, default: '' },
  takeTime:    { type: String, default: '' },
  takeSite:    { type: String, default: '' },
  backSite:    { type: String, default: '' },

  // 文案/图标
  titleText:   { type: String, default: '费用合计' },
  showInfo:    { type: Boolean, default: true },
  icons: {
    type: Object,
    default: () => ({
      package: '/static/icons/taocan.png',
      info: '/static/icons/infor.png'
    })
  },
  pkgLabel:    { type: String, default: '使用套餐' },
  couponLabel: { type: String, default: '优惠券抵扣' },
  metaLabels: {
    type: Object,
    default: () => ({
      distance: '行驶里程',
      duration: '用车时长',
      takeTime: '取车时间',
      takeSite: '取车网点',
      backSite: '还车网点'
    })
  },
  expandText:  { type: String, default: '展开更多' },
  collapseText:{ type: String, default: '收起更多' },

  // 展开控制
  modelValue: { type: Boolean, default: true },     // v-model:expanded
})

const emit = defineEmits(['update:modelValue'])

const showSheet = ref(false)
const innerExpanded = ref(!!props.modelValue)
watch(() => props.modelValue, v => innerExpanded.value = !!v)

const fmt = (n) => Number((n ?? 0) === '' ? 0 : n).toFixed(2)
const fmtAbs = (n) => Math.abs(Number((n ?? 0) === '' ? 0 : n)).toFixed(2)
const isNegative = (v) => Number(v) < 0

const normalizedRows = computed(() =>
  (props.rows || []).map(r => ({ k: String(r?.k ?? ''), v: (r?.v ?? 0) }))
)

const hasMeta = computed(() =>
  !!(props.distanceKm || props.useDuration || props.takeTime || props.takeSite || props.backSite)
)

function toggle() {
  innerExpanded.value = !innerExpanded.value
  emit('update:modelValue', innerExpanded.value)
}
function onInfo() {
  if (!props.showInfo) return
  showSheet.value = true
}
</script>

<style scoped>
/* 避免宽度计算误差带来的“右边顶满” */
.fee, .card, .saving-banner { box-sizing: border-box; }

/* 容器左右内边距控制整体宽度 */
.fee{ padding:20rpx 20rpx 0 }

/* ========== 省钱横条（上圆角 24rpx） ========== */
.saving-banner{
  background:#FFF3DF;
  border-top-left-radius:24rpx;
  border-top-right-radius:24rpx;
  border-bottom-left-radius:0;
  border-bottom-right-radius:0;
  height:100rpx;
  padding:0 24rpx;
  display:flex; align-items:center;
}
.tc-icon{ width:36rpx; height:36rpx; margin-right:16rpx }
.saving-text{ font-size:28rpx; color:#222; line-height:38rpx }
.saving-amt{ font-family:D-DIN; font-weight:700; font-size:40rpx; color:#F5222D; margin:0 6rpx }

/* ========== 主卡片（与横条拼接：上角为 0、下角 32rpx） ========== */
.card{
  background:#fff;
  border-radius:0 0 32rpx 32rpx;
  padding:32rpx 24rpx;
  margin:0 0 20rpx;
}

/* 顶部金额区 */
.header{ display:flex; align-items:center; justify-content:space-between; margin-bottom:7rpx }
.left{ display:flex; align-items:center; flex:1; min-width:0 }
.title{ font-weight:500; font-size:32rpx; color:#222 }
.infor{ width:36rpx; height:36rpx; margin-left:12rpx }
.amt{ font-family:D-DIN; font-size:48rpx; font-weight:700; color:#FD0300; line-height:1 }
.amt .yen{ font-size:36rpx; font-weight:400; margin-right:4rpx }
.amt{ flex-shrink:0 }

/* 费用行 */
.row{
  display:flex; align-items:center; justify-content:space-between;
  padding:12rpx 0;
}
.row .k{ flex:1; min-width:0; font-size:28rpx; color:#888 }
.row .v{ flex-shrink:0; font-size:30rpx; color:#FF8F1F }
.row.negative .v{ color:#FF4D4F } /* 抵扣为负，展示红色 */
.row.strong{ font-size:32rpx; color:#222 }
.strong-val{ color:#222 }

/* 元信息（标注：32rpx/#222/行高 38.4rpx；右侧右对齐） */
.meta{ margin-top:8rpx }
.meta .line{ display:flex; justify-content:space-between; align-items:center; padding:12rpx 0 }
.meta .label{ font-size:32rpx; font-weight:400; color:#222; line-height:38.4rpx }
.meta .value{
  font-size:28rpx; font-weight:400; color:#222; line-height:38.4rpx;
  text-align:right; max-width:60%;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  flex-shrink:0;
  
  
}
/* 网点字段允许两行省略（想单行就删掉本块） */
.meta .value.site{
  flex:1;                /* 让右侧可伸缩 */
  text-align:right;
  max-width:70%;         /* 控制最大宽度，避免挤满 */
  overflow:hidden;
  white-space:nowrap;
  text-overflow:ellipsis;  
}

/* 展开/收起 */
.more{
  margin-top:8rpx; padding-top:8rpx;
  display:flex; align-items:center; justify-content:center;
}
.more-text{ font-size:28rpx; color:#AAA; line-height:33.6rpx; margin-right:12rpx }
.arrow{
  width:0; height:0;
  border-left:12rpx solid transparent;
  border-right:12rpx solid transparent;
  border-top:14rpx solid #CCC;
  transition:transform .18s ease;
}
.arrow.open{ transform:rotate(180deg) }
</style>
