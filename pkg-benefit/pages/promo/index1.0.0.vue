<template>
  <view class="container">
    <!-- 1. 用户信息 -->
    <view class="user-info">
      <image class="avatar" :src="user.avatar" />
      <view class="info">
        <text class="nickname">嗨，{{ user.name }}！</text>
        <text class="summary">已邀请 {{ invites.length }} 位好友</text>
      </view>
    </view>

    <!-- 2. 推广码 + 分享按钮 -->
    <view class="code-box">
      <text>我的邀请链接：</text>
      <text selectable class="code">{{ user.inviteCode }}</text>
      <button size="mini" @click="copyCode">复制</button>
    </view>

    <!-- 3. 海报分享 -->
    <view class="poster-box">
      <image class="poster" :src="user.poster" mode="widthFix" />
      <view class="poster-btns">
        <button size="mini" @click="savePoster">保存海报</button>
        <button size="mini" open-type="share">分享好友</button>
      </view>
    </view>

    <!-- 4. 邀请记录 -->
    <view class="invite-list">
      <view class="record" v-for="(item, index) in invites" :key="index">
        <text>{{ item.name }}｜{{ item.status }}｜{{ item.reward }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const user = ref({
  name: '嗒嗒',
  avatar: '/static/avatar.png',
  inviteCode: '#小程序://嗒嗒用车/c9zvw8jaaBOQU8f',
  poster: '/static/poster.jpg',
})

const invites = ref([
  { name: '湉湉', status: '已认证｜已下单 ✅', reward: '+5元' },
  { name: '小杰', status: '未认证 ❌', reward: '无' },
])

function copyCode() {
  uni.setClipboardData({ data: user.value.inviteCode })
}

function savePoster() {
  uni.downloadFile({
    url: user.value.poster,
    success: res => {
      uni.saveImageToPhotosAlbum({ filePath: res.tempFilePath })
    }
  })
}
</script>

<style scoped>
.container { padding: 20rpx; }
.user-info { display: flex; align-items: center; margin-bottom: 20rpx; }
.avatar { width: 80rpx; height: 80rpx; border-radius: 50%; }
.info { margin-left: 20rpx; }
.code-box, .poster-box { margin: 20rpx 0; }
.code { font-weight: bold; color: #409eff; margin: 0 10rpx; }
.poster { width: 100%; border-radius: 12rpx; }
.poster-btns { display: flex; justify-content: space-around; margin-top: 10rpx; }
.invite-list .record { padding: 10rpx; border-bottom: 1px solid #eee; }
</style>
