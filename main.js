import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import uviewPlus from 'uview-plus'
import 'uview-plus/theme.scss'   // 记得引入样式文件
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
import uniTransition from '@dcloudio/uni-ui/lib/uni-transition/uni-transition.vue' // 👈 添加

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  // 全局注册 uni-icons
  app.component('uni-icons', uniIcons)
  app.component('uni-transition', uniTransition) // 👈 注册它
  app.use(pinia)
  app.use(uviewPlus)
  return {
    app,
    pinia,
  }
}
