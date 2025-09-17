<template>
  <view class="list">
    <!-- 顶部：我的收入 + 金额 + 去提现 -->
    <view class="hd">
      <view class="total">
        <text class="label">我的收入</text>
        <view class="money-line">
          <text class="yen">￥</text>
          <text class="money">{{ total }}</text>
        </view>
      </view>
      <text class="withdraw" @tap="$emit('withdraw')">去提现</text>
    </view>

    <!-- 表头 -->
    <view class="thead">
      <text class="c1">微信昵称</text>
      <text class="c2">邀请时间</text>
      <text class="c3">好友状态</text>
      <text class="c4">奖励金额</text>
    </view>

    <!-- 行 -->
    <view v-for="(r,i) in records" :key="i" class="row">
      <view class="c1 nick">
        <image class="avatar" :src="'/static/icons/dada.png'"   mode="aspectFill"  />
        <text class="name">{{ r.name }}</text>
      </view>
      <text class="c2 time">{{ r.time }}</text>
      <text class="c3 status">{{ r.status }}</text>
      <text class="c4 reward">{{ r.reward }}</text>
    </view>

    <view v-if="!records || !records.length" class="empty">
      暂无好友助力信息，快去邀请好友一起赚钱吧！
    </view>
  </view>
</template>

<script setup>
defineProps({
  total: { type: [Number, String], default: 0 },
  records: { type: Array, default: () => [] }
})
defineEmits(['withdraw'])
</script>

<style scoped>
/* 卡片容器：#FFF6F1 + 卡券投影 + 圆角 32rpx */
.list{
  width: 690rpx;
  margin: 20rpx auto 40rpx;
  padding: 24rpx 24rpx 28rpx;
  background: #FFF6F1;
  border-radius: 32rpx;
  box-shadow: 0rpx -4rpx 16rpx 0rpx rgba(169,223,192,0.2);
  box-sizing: border-box;
}

/* 顶部：我的收入 + 金额 + 去提现 */
.hd{ display:flex; justify-content:space-between; align-items:flex-end; margin-top: 10rpx; }
.total{ display:flex; align-items:flex-end; gap:16rpx; }
.label{
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:550; font-size:32rpx; line-height:44rpx; color:#222222;
}
.money-line{ 
	display:flex; align-items:flex-end; gap:2rpx; 
	  align-items: baseline;   /* 关键 */

	}
.yen{
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:500; font-size:32rpx; line-height:44rpx; color:#FF0130;
   
}
.money{
  font-family:"D-DIN","DIN Alternate","Arial Narrow",sans-serif;
  font-weight:700; font-size:72rpx; line-height:44rpx; color:#FF0130;
    line-height:1;           /* 关键 */
}
.withdraw{
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:400; font-size:24rpx; line-height:32rpx; color:#FF4C01; padding-right: 16rpx;
}

/* 表头与行：固定列宽更贴标注（总宽≈690rpx） */
.thead, .row{
  display:grid;
  grid-template-columns: 180rpx 180rpx 160rpx 120rpx; /* 昵称/时间/状态/金额 */
  align-items:center;
}
.thead{
  margin-top: 18rpx; padding: 12rpx 0;
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:600; font-size:28rpx; line-height:38rpx; color:#222;
}
.row{
  padding: 18rpx 0;
  border-top: 2rpx dashed #F0F0F0;
  font-size: 28rpx; line-height: 38rpx; color:#444;
}

/* 昵称单元：头像 40rpx + 名字 28rpx */
.nick{ display:flex; align-items:center; gap:14rpx; }
.avatar{ width:40rpx; height:40rpx; border-radius:50%; }
.name{
  max-width: 200rpx;
  overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:400; font-size:28rpx; color:#444444;
}

/* 时间、状态、金额的样式 */
.time{
  font-family:"Inter","PingFang SC",sans-serif;
  font-weight:400; font-size:28rpx; color:#666666;
}
.status{
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:400; font-size:28rpx; color:#444444;
}
.reward{
  text-align:center;
  font-family:"AlibabaPuHuiTi","PingFang SC",sans-serif;
  font-weight:400; font-size:28rpx; color:#FF0130;
}

/* 空状态 */
.empty{ text-align:center; color:#999; padding:60rpx 0; font-size:26rpx; }
</style>
