<template>
  <view v-if="visible" class="bs-mask" @tap="close">
    <view class="bs-panel" @tap.stop>
      <view class="bs-header">
        <text class="bs-title">计费说明</text>
        <view class="bs-close" @tap="close">×</view>
      </view>

      <!-- 可滑动主体 -->
      <scroll-view scroll-y class="bs-body">
        <!-- 你可以替换成后端返回的文案；这里按你截图放了默认内容 -->
        <view class="section">
          <text class="p">
            还车时，应注意四座车型续航里程必须保留不少于30KM，
            五座车型续航里程必须保留不少于50KM，否则将收取¥200/次电池损耗费。
            或因车辆电量不足而产生的拖车费用，由用户自行承担。
          </text>
          <text class="p">
            特惠套餐车辆为固定租用时段，不能更改用车时间，不能更改套餐，不能越网点换车；
            只可用套餐优惠券，必须购买不计免赔；提前还车不退租车费用；下单套餐后15分钟内免费取消，
            超时不可取消；套餐可提前下单；非套餐时间按正常时租收费；超出套餐12小时自动扣费 1 日。
			特惠套餐车辆为固定租用时段，不能更改用车时间，不能更改套餐，不能越网点换车；
			只可用套餐优惠券，必须购买不计免赔；提前还车不退租车费用；下单套餐后15分钟内免费取消，
			超时不可取消；套餐可提前下单；非套餐时间按正常时租收费；超出套餐12小时自动扣费 1 日。
			特惠套餐车辆为固定租用时段，不能更改用车时间，不能更改套餐，不能越网点换车；
			只可用套餐优惠券，必须购买不计免赔；提前还车不退租车费用；下单套餐后15分钟内免费取消，
			超时不可取消；套餐可提前下单；非套餐时间按正常时租收费；超出套餐12小时自动扣费 1 日。
			特惠套餐车辆为固定租用时段，不能更改用车时间，不能更改套餐，不能越网点换车；
			只可用套餐优惠券，必须购买不计免赔；提前还车不退租车费用；下单套餐后15分钟内免费取消，
			超时不可取消；套餐可提前下单；非套餐时间按正常时租收费；超出套餐12小时自动扣费 1 日。
          </text>

          <view class="sub-title">跨区计费列表</view>
          <view class="list">
            <view class="li">晋江市｜祖昌体育中心（停车停卡亭位，低电量将未充电电量扣费，按规拖车，停车车头朝外，否则后果自负）</view>
            <view class="li">丰泽区｜海悦花苑（勿停充电桩）</view>
            <view class="li">南安市｜大叠豪成停车场</view>
            <view class="li">晋江市｜竹树下工业区（勿停充电桩）</view>
            <view class="li">晋江市｜溜溪花园（停车勿超过石墩勿停收费处，靠右侧树边停车，左边过道不能停，否则后果自负）</view>
          </view>
        </view>
      </scroll-view>

      <view class="bs-footer">
        <button class="bs-ok" @tap="close">我知道了</button>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({ visible: { type: Boolean, default: false } })
const emit = defineEmits(['close'])
const close = () => emit('close')
</script>

<style scoped>
/* 遮罩 + 面板（底部弹出） */
.bs-mask{ position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:2000; display:flex; align-items:flex-end; }
.bs-panel{ width:100%; background:#fff; border-top-left-radius:24rpx; border-top-right-radius:24rpx; max-height:80vh; }

/* 头部 */
.bs-header{ padding:24rpx; display:flex; align-items:center; justify-content:center; position:relative; }
.bs-title{ font-size:32rpx; font-weight:600; color:#222; }
.bs-close{ position:absolute; right:12rpx; top:8rpx; width:64rpx; height:64rpx; display:flex; align-items:center; justify-content:center; font-size:44rpx; color:#999; }

/* 可滑动主体 */
.bs-body{ max-height:56vh; padding:0 24rpx 12rpx; }
.section .p{ display:block; font-size:28rpx; color:#444; line-height:44rpx; margin:12rpx 0; }
.sub-title{ margin-top:8rpx; font-size:30rpx; font-weight:600; color:#0DB63D; }
.list .li{ margin-top:10rpx; font-size:26rpx; color:#666; line-height:40rpx; }

/* 底部按钮 */
.bs-footer{ padding:16rpx 24rpx 28rpx; }
.bs-ok{
  width:100%; height:88rpx; border-radius:44rpx;
  background:linear-gradient(180deg,#82ED71 0%, #0DB63D 100%);
  color:#fff; font-size:32rpx; font-weight:600;
}
</style>
