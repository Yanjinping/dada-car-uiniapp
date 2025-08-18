<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
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
/* 1) 字体（有普惠体文件就放 /static/fonts/，没有也能跑，会回退系统字体） */
@font-face {
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
}
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

</style>
