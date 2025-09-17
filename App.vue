<script>
	// import { installPaymentInterceptor } from '@/utils/paymentGuard'

	export default {
		onLaunch: function() {
			console.log('App Launch')
			// 1) 计算基础地址
			const env = process.env.NODE_ENV || 'development' // 'development' | 'production'
			const base = env === 'development'
			  ? 'http://localhost:8081/api'
			  : 'http://dada.natapp1.cc/api'
			
			// 2) 写到 App 实例，不用 getApp()
			this.globalData = this.globalData || {}
			this.globalData.BASE_URL = base.replace(/\/$/, '')
			
			// 3) 兜底到 uni（分包/子上下文也可读）
			uni.$BASE_URL = this.globalData.BASE_URL
			
		console.log('🌐 设置 BASE_URL =', this.globalData.BASE_URL)  // <--- 确认日志
		
		// installPaymentInterceptor()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		 onError(err) {
		    console.error('[App.onError]', err)
		  },
	}
</script>

<style>

/* 隐藏全局滚动条 */
::-webkit-scrollbar {
  display: none; /* Chrome、Safari */
}

/* 适配其他浏览器 */
body {
  -ms-overflow-style: none;  /* IE、Edge */
  scrollbar-width: none;     /* Firefox */
}	
		
/* 1) 字体（有普惠体文件就放 /static/fonts/，没有也能跑，会回退系统字体） */
/* @font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('/static/fonts/AlibabaPuHuiTi-Regular.woff2') format('woff2'),
       url('/static/fonts/AlibabaPuHuiTi-Regular.woff') format('woff'),
       url('/static/fonts/AlibabaPuHuiTi-Regular.ttf') format('truetype');
  font-weight: 400; font-style: normal; font-display: swap;
}
@font-face {
  font-family: 'AlibabaPuHuiTi';
  src: url('/static/fonts/AlibabaPuHuiTi-Medium.woff2') format('woff2'),
       url('/static/fonts/AlibabaPuHuiTi-Medium.woff') format('woff'),
       url('/static/fonts/AlibabaPuHuiTi-Medium.ttf') format('truetype');
  font-weight: 500; font-style: normal; font-display: swap;
} */
page, view, text, button {
  font-family: AlibabaPuHuiTi, "PingFang SC", "Microsoft Yahei", Helvetica, Arial;
}

/* 2) 设计 Tokens（颜色、尺寸、字号等） */
:root{
  --c-title:#222222; --c-sub:#AAAAAA; --c-tip:#666666;
  --c-green:#0DB63D; --c-green-light:#82ED71;
  --c-border:#E0E0E0; --c-line:#EAEAEA;
  --c-orange:#F4A33E; --c-disabled-bg:#E6E6E6; --c-disabled-txt:#B3B3B3;
  --pad-page:30rpx;
  --w-card:688rpx; --h-card:320rpx; --h-overlay:96rpx; --h-btn:96rpx; --r-btn:48rpx;
}

/* #ifdef H5 */
html, body, #app { height: 100%; }

/* 优先：支持的浏览器会稳定预留滚动条沟槽 */
html, body {
  overflow-y: auto;
  scrollbar-gutter: stable both-edges; /* 关键 */
}

/* 兜底：不支持 scrollbar-gutter 的浏览器，强制总是显示纵向滚动条 */
body { overflow-y: scroll; }
/* #endif */

</style>
