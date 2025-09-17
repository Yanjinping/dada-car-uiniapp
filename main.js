// main.js
import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
// UI 库
import uviewPlus from 'uview-plus'
import 'uview-plus/theme.scss'
// 全局组件（uni-ui）
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import uniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue'
// import { installPaymentInterceptor } from '@/utils/paymentGuard'

export function createApp() {
  const app = createSSRApp(App)

  // Pinia
  const pinia = createPinia()
  app.use(pinia)

  // uview-plus
  app.use(uviewPlus)

  // 全局注册 uni-ui 组件
  app.component('uni-icons', uniIcons)
  app.component('uni-transition', uniTransition)
  // ★ 全局安装-> 检查未支付订单
  // installPaymentInterceptor()   

  return {
    app,
    pinia
  }
}
