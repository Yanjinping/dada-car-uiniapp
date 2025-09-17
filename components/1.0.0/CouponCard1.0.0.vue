<template>
  <view class="coupon-card" :class="[`s-${status}`]">
    <!-- 上半：金额 + 信息 -->
    <view class="top">
      <!-- 左：金额柱 -->
      <view class="left">
        <view class="price">
          <text class="yuan">¥</text>
          <text class="amt">{{ amount }}</text>
        </view>
        <text v-if="thresholdText" class="threshold">{{ thresholdText }}</text>
      </view>

      <!-- 右：标题/副标题/有效期 + 规则 -->
      <view class="info">
        <image class="che" src="/static/benefit/che-bg.png" mode="widthFix" />
        <view class="title ell">{{ title }}</view>
        <view v-if="subTitle" class="sub">{{ subTitle }}</view>

        <view class="meta">
          <text class="expire">{{ expireText }}</text>
          <button class="rule" @click.stop="$emit('rule')">使用规则</button>
        </view>
      </view>
    </view>

    <!-- 中：虚线分割 -->
    <view class="dash"></view>

    <!-- 下半：CTA（单按钮/双按钮自适配） -->
    <view class="cta" :class="showGift ? 'two' : 'one'">
      <button v-if="showGift" class="btn ghost" :disabled="isDisabled" @click="$emit('gift')">送给好友</button>
      <button class="btn solid" :class="!showGift ? 'full' : ''" :disabled="isDisabled" @click="$emit('cta')">
        {{ ctaText }}
      </button>
    </view>

    <!-- 状态遮罩：已使用/已过期 -->
    <view v-if="status==='used' || status==='expired'" class="mask">
      <text class="mask-text">{{ status==='used' ? '已使用' : '已过期' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

// 画板字段
const props = defineProps({
  amount: { type: [Number, String], required: true },
  thresholdText: { type: String, default: '' },
  title: { type: String, required: true },
  subTitle: { type: String, default: '' },
  expireText: { type: String, required: true },
  ctaText: { type: String, default: '立即使用' },
  status: { type: String, default: 'available' }, // available | disabled | used | expired
  disabledReason: { type: String, default: '' },
  showGift: { type: Boolean, default: true }
})
const isDisabled = computed(() => ['disabled','used','expired'].includes(props.status))
</script>

<style scoped lang="scss">
/* === 卡片容器（690×自适应，高度约352） === */
.coupon-card{
  position: relative;
  width: 690rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  padding: 24rpx;
  box-shadow: 0rpx -4rpx 16rpx rgba(169,223,192,0.2);
  overflow: hidden;
}

/* 顶部区域布局 */
.top{ display:flex; gap:24rpx; }

/* 左：金额柱（180宽） */
.left{
  width:180rpx; padding-left:20rpx; padding-top:6rpx;
  border-right: 2rpx dashed rgba(0,0,0,.06);
}
.price{ display:flex; align-items:flex-end; gap:6rpx; }
.yuan{ font-size:32rpx; line-height:44rpx; color:#FF7009; font-weight:500; }
.amt{ font-size:80rpx; line-height:88rpx; color:#FF7009; font-weight:700; }
.threshold{ margin-top:8rpx; font-size:22rpx; line-height:30rpx; color:#FF7009; }

/* 右：文字信息 */
.info{ flex:1; min-width:0; position:relative; }
.title{ font-size:32rpx; line-height:44rpx; color:#222; font-weight:500; }
.sub{ margin-top:8rpx; font-size:24rpx; line-height:32rpx; color:#888; }
.meta{ margin-top:12rpx; display:flex; align-items:center; gap:12rpx; }
.expire{
  display:inline-block; padding:6rpx 12rpx;
  font-size:24rpx; line-height:40rpx; color:#FFA24A;
  background:#FFF3DF; border-radius:10rpx;
}
.rule{
  height:40rpx; line-height:40rpx; padding:0 12rpx;
  font-size:24rpx; color:#666; background:#F2F2F2; border-radius:8rpx;
}
.che{ position:absolute; right:0; top:0; width:154rpx; opacity:.1; }

/* 中间：虚线分割（与蓝湖一致） */
.dash{ height:0; border-top:2rpx dashed rgba(0,0,0,.08); margin: 20rpx 0 16rpx; }

/* 底部 CTA：大圆角按钮 */
.cta{ display:flex; align-items:center; gap:20rpx; }
.cta.one{ justify-content:center; }
.btn{
  height:96rpx; border-radius:48rpx; font-size:30rpx;
}
.btn.full{ width:650rpx; } /* 单按钮铺满：650×96 */
.solid{
  padding:0 40rpx;
  background: linear-gradient(316deg, #F3A03A 0%, #FFC868 100%);
  color:#222; font-weight:600;
}
.ghost{
  min-width:240rpx;
  background:#FFF; color:#FFA24A;
  border:2rpx solid #FFA24A;
}

/* 状态样式 */
.s-disabled .btn{ opacity:.6; }
.mask{
  position:absolute; inset:0; background:rgba(255,255,255,.6);
  display:flex; align-items:center; justify-content:center;
}
.mask-text{ font-size:28rpx; color:#666; padding:8rpx 16rpx; background:#FFF; border-radius:8rpx; }

/* 工具 */
.ell{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
</style>
