// utils/uniToast.js ✅ 推荐写法
export default function uniToast(title = '操作失败', icon = 'none', duration = 2000) {
  uni.showToast({
    title,
    icon,
    duration
  })
}
