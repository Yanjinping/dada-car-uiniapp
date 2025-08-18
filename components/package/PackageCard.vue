<template>
  <view class="card">
    <!-- 主体 -->
    <view class="main">
      <!-- 左侧信息 -->
      <view class="info">
        <!-- 标题（最多两行，超出省略） -->
        <view class="title">{{ title }}</view>
        <view class="sub" v-if="subTitle">{{ subTitle }}</view>

        <!-- 到期时间 pill（“2025.08.11 23:59:59 到期” 一行显示） -->
        <view class="expire-pill" v-if="expireDateOnly">
          <text class="expire-date">{{ expireDateOnly }}</text>
          <text class="expire-suffix">到期</text>
        </view>
		<!-- 套餐说明（切图背景，位于车图“上面偏下”） -->
		  <button class="rule-btn" @tap="$emit('rule')">
		    {{ ruleBtnText }}
		  </button>
		
      </view>
	<!-- 右侧价格 -->
      <view class="price">
        <text class="currency">{{ currency }}</text>
        <text class="num">{{ price }}</text>
      </view>

      <!-- 右侧叠加：车水印 + “套餐说明”切图按钮（整体靠右一点） -->
      <view class="overlay">
        <!-- 渐变罩（按标注灰色 80%->40%） -->
        <view class="car-grad"></view>
        <!-- 车图（按标注 154×154，放在渐变罩下面一点） -->
        <image
          class="car"
          :src="bgWatermark || defaultCar"
          mode="widthFix"
        />
      
      </view>
    </view>

    <!-- 虚线分割（可选） -->
    <view v-if="footerDashed" class="dash"></view>

    <!-- 底部按钮区：有 secondaryBtn=双按钮；没有=整行主按钮 -->
    <view class="btns" :class="{ single: !secondaryBtn }">
      <button
        v-if="secondaryBtn"
        class="btn secondary"
        @tap="$emit('tap-secondaryBtn')"
      >
        {{ secondaryBtn.text || '送给好友' }}
      </button>

      <button
        class="btn"
        :class="primaryBtn?.theme === 'dark' ? 'dark' : 'primary'"
        @tap="$emit('tap-primaryBtn')"
      >
        {{ primaryBtn?.text || '立即使用' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 价格区
  price: { type: [Number, String], default: '' },
  currency: { type: String, default: '¥' },

  // 左侧文本
  title: { type: String, default: '' },
  subTitle: { type: String, default: '' },

  // 到期（可传 “2025.08.11 23:59:59到期 / 2025.08.11 23:59:59 到期 / 仅日期”）
  expireText: { type: String, default: '' },

  // 右侧叠加
  ruleBtnText: { type: String, default: '套餐说明' },
  bgWatermark: { type: String, default: '' }, // 车图，可不传使用默认

  // 分割/按钮
  footerDashed: { type: Boolean, default: true },
  primaryBtn: { type: Object, default: null },   // { text, theme?: 'dark' }
  secondaryBtn: { type: Object, default: null }  // { text }
})

const defaultCar = '/static/benefit/car-fade.png' // 车切图路径（按你工程放置）

// 只取日期部分，统一 “到期” 由 UI 拼接，保证一行
const expireDateOnly = computed(() => {
  return (props.expireText || '').replace(/到期/g, '').trim()
})
</script>

<style scoped>
/* ===== 容器 ===== */
.card{
  margin: 12rpx 0;
  padding: 20rpx;
  background: #fff;
  border-radius: 24rpx;
  position: relative;
  box-sizing: border-box;
}

/* ===== 主体行 ===== */
.main{
  position: relative;
  display: flex;
  align-items: center;
}

/* 左侧信息 */
.info{
  flex: 1;
  padding-right: 180rpx;           /* 右侧为叠加区 & 避免文字撞到 */
  box-sizing: border-box;
}
.title{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 600;
  font-size: 32rpx;
  line-height: 44rpx;
  color: #222;
  display: -webkit-box;
  -webkit-line-clamp: 2;           /* 标题最多两行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12rpx;       /* 新增：拉开与时间的距离 */
}
.sub{
  margin-top: 6rpx;
  font-size: 24rpx;
  line-height: 32rpx;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 到期 pill（日期一行，不换） */
.expire-pill{
  width: 316rpx;
  height: 40rpx;
  margin-top: 10rpx;
  display: inline-flex;
  align-items: center;
  padding: 4rpx 8rpx ;
  background: #FFF3E1;
  border-radius: 8rpx;
  white-space: nowrap;            /* 整个 pill 不换行 */
  margin-top: 10rpx;              /* 由标题的 margin-bottom 控制了 */
  margin-bottom: 10rpx;       /* 新增：与“套餐说明”的距离 */
}
.expire-date{
  font-family: Inter, sans-serif;
  font-weight: 400;
  font-size: 24rpx;
  line-height: 40rpx;
  color: #FFA24A;
  white-space: nowrap;
}
.expire-suffix{
  margin-left: 6rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 400;
  font-size: 26rpx;
  line-height: 40rpx;
  color: #FFA24A;
  white-space: nowrap;
}

/* 右侧价格（右对齐、橙色） */
.price{
	  position: absolute;
	  top: 20rpx;     /* ↑ 往上就减小这个值，如 18rpx、12rpx */
	  right: 24rpx;   /* ← 往左就增大这个值，如 36rpx、48rpx */
  min-width: 210rpx;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 6rpx;
    z-index: 2;     /* 关键：比车图的层级高 */

}
.price .currency{
  font-family: AlibabaPuHuiTi, sans-serif;
  font-weight: 500;
  font-size: 32rpx;
  line-height: 44rpx;
  color: #FF7009;
}
.price .num{
  font-family: "D-DIN-Bold","DIN Alternate","Arial Narrow", AlibabaPuHuiTi, sans-serif;
  font-weight: 700;
  font-size: 72rpx;
  line-height: 44rpx;  /* 与标注同感受（顶齐） */
  color: #FF7009;
}

/* 右侧叠加：整体靠右一点（不挡价格） */
.overlay{
  position: absolute;
  right: 24rpx;              /* 控制整组偏右 */
  top: 24rpx;
  width: 154rpx;
  height: 116rpx;            /* 渐变罩高度 */
  pointer-events: none;      /* 不挡点击 */
}

/* 渐变罩（80%->40%） */
.car-grad{
  position: absolute;
  left: 0; top: 0;
  width: 154rpx; height: 116rpx;
  /* background: linear-gradient(180deg, rgba(245,245,245,0.8) 0%, rgba(245,245,245,0.4) 100%); */
  border-radius: 0;
}

/* 车图（在渐变罩后面露出底部） */
.car{
  position: absolute;
  left: 0;
  top: -20rpx;               /* 让车图上探一点，露出更多轮廓 */
  width: 154rpx;
  opacity: .95;              /* 由渐变罩柔化整体明度 */
}

/* 套餐说明：切图背景按钮，位于“车图的上面偏下” */
.rule-btn{
 
 align-self: flex-start;     /* 左对齐 */
 width: 140rpx;
  height: 40rpx;
  padding: 0 14rpx;
  border-radius: 10rpx;
  font-family: Inter, sans-serif;
  font-size: 24rpx;
  line-height: 40rpx;
  color: #666;
  margin: 0;                  /* 由 expire-pill 的 bottom 控制间距 */
background: #EEEEEE;
}

/* 虚线分割 */
.dash{
  height: 0;
  margin: 20rpx 0;
  border-top: 2rpx dashed #DDDDDD;
}

/* ===== 底部按钮 ===== */
.btns{
  display: flex;
  gap: 20rpx;
}
.btn{
  flex: 1;
  height: 96rpx;
  border-radius: 48rpx;
  font-family: AlibabaPuHuiTi, sans-serif;
  font-size: 36rpx;
  line-height: 50rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: none;
}

/* 双按钮 */
.btn.secondary{
  max-width: 240rpx;
  background: #FFF3DF;
  color: #FFA24A;
  box-shadow: 0 6rpx 12rpx rgba(255,162,74,.15); /* 柔和但有质感 */
}
.btn.primary{
  max-width: 390rpx;
  background: linear-gradient(316deg, #F3A03A 0%, #FFC868 100%);
  color: #fff;
}

/* 单按钮（暗黑一键购买） */
.btns.single .btn{
  max-width: 650rpx;
}
.btns.single .btn.dark{
  background: #333;
  color: #FAC263;
}
</style>
