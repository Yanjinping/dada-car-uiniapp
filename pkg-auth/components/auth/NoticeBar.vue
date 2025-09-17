<template>
  <view class="notice">
    <image class="icon" src="/static/icons/warn-yellow.png" mode="widthFix" />
    <text class="txt">仅用于身份验证，我们依照隐私政策保护您的个人信息</text>
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
  width: 700rpx;
  height: 36rpx;
  
  font-family: 'AlibabaPuHuiTi', sans-serif;
  font-weight: 400;
  font-size: 26rpx;
  color: #F4A33E;
  line-height: 36rpx;
  text-align: left;
}
</style>
