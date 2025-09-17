<template>
  <view class="notice">
    <image class="icon" src="/static/icons/warn-yellow2.png" mode="widthFix" />
    <text class="txt">请确认车辆停放在指定位置，关闭所有车灯、车门和窗户</text>
  </view>
</template>

<style scoped>
.notice {
/*  margin: 8rpx var(--pad-page) 0 */;
  padding: 7rpx ;
  display: flex;
  align-items: center;

  border-radius: 12rpx;
}

/* 左侧小图标：36×36，与标注一致 */
.icon {
  width: 36rpx;
  height: 36rpx;
  margin-right: 7rpx;
}

/* 文本样式：完全按蓝湖标注 */
.txt {
height: 36rpx;
font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
font-weight: 500;
font-size: 22rpx;
color: #F66700;
line-height: 32rpx;
text-align: right;
font-style: normal;
text-transform: none;
}
</style>
