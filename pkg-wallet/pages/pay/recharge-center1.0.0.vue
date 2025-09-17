<template>
  <view class="container">
    <!-- 余额展示 -->
    <view class="balance-card">
      <view class="balance-title">当前余额</view>
      <view class="balance-amount">¥{{ balance }}</view>
    </view>

 <!-- 充值金额选项 -->
 <view class="card amount-card">
   <view class="card-header">
     <view class="card-title">
       <text class="card-icon">💰</text>
       选择充值金额
     </view>
   </view>
   <view class="card-content">
     <radio-group 
       @change="handleAmountChange" 
       class="amount-group"
     >
       <view 
         v-for="amount in amountOptions" 
         :key="amount" 
         class="amount-item"
       >
         <label class="amount-label">
           <radio 
             :value="amount" 
             :checked="selectedAmount === amount"
             class="amount-radio" 
           />
           <view class="amount-info">
             <view class="amount-value">¥{{ amount }}</view>
             <view 
               class="amount-bonus" 
               v-if="amount >= 100"
             >
               赠送 ¥{{ Math.floor(amount * 0.1) }}
             </view>
           </view>
         </label>
       </view>
     </radio-group>
   </view>
 </view>

    <!-- 支付方式 -->
    <view class="card payment-card">
      <view class="card-header">
        <view class="card-title">
          <text class="card-icon">💳</text>
          选择支付方式
        </view>
      </view>
<view class="card-content">
  <radio-group @change="handlePaymentChange" class="payment-group">
    <view v-for="payment in paymentMethods" :key="payment.value" class="payment-item">
      <label class="payment-label">
        <radio
          :value="payment.value"
          class="payment-radio"
          :checked="selectedPayment === payment.value"
        />
        <view class="payment-info">
          <image class="payment-icon" :src="payment.icon" mode="aspectFit" />
          <view class="payment-name">{{ payment.name }}</view>
        </view>
      </label>
    </view>
  </radio-group>
</view>

    </view>

    <!-- 充值按钮 -->
    <button class="confirm-btn" @click="onRecharge">
      💰 确认充值 ¥{{ selectedAmount || 0 }}
    </button>

    <!-- 充值记录 -->
    <view class="card history-card">
      <view class="card-header">
        <view class="card-title">
          <text class="card-icon">📝</text>
          最近充值记录
        </view>
      </view>
      <view class="card-content">
        <view v-if="rechargeHistory.length === 0" class="empty-history">
          暂无充值记录
        </view>
        <view v-else>
          <view v-for="(record, index) in rechargeHistory" :key="index" class="history-item">
            <view class="history-amount">+¥{{ record.amount }}</view>
            <view class="history-info">
              <view class="history-date">{{ record.date }}</view>
              <view class="history-method">{{ record.method }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import {  recharge, applyWithdraw } from '../api/index.js';
import { getUserAvailableCoupons} from '../api/coupon.js';
import { getAllBalances, getBalance,} from '../api/wallet.js';

// 数据定义
const balance = ref(0.0)
const selectedAmount = ref(0)
const selectedPayment = ref('wechat')
const amountOptions = ['20', '50', '100', '200', '500']
// 账户类型映射
const ACCOUNT_TYPES = {
  ACCOUNT_BALANCE: 'accountBalance',
  ACCOUNT_DEPOSIT: 'deposit',
  ACCOUNT_VIOLATION_DEPOSIT: 'violationDeposit',
  ACCOUNT_LONG_RENT_DEPOSIT: 'longRentDeposit',
  ACCOUNT_WITHDRAWAL: 'withdrawal'
}

// 资金变动类型映射
const RECORD_TYPES = {
  RECORD_EXPENSE: 'expense',
  RECORD_INCOME: 'income'
}
const paymentMethods = ref([
  { value: 'wechat', name: '微信支付', icon: '/static/wechat.png' },
  { value: 'alipay', name: '支付宝', icon: '/static/alipay.png' },
  { value: 'unionpay', name: '云闪付', icon: '/static/unionpay.png' }
])
const rechargeHistory = ref([
  { amount: 100, date: '2023-05-15 14:30', method: '微信支付' },
  { amount: 50, date: '2023-04-20 09:15', method: '支付宝' }
])

// 获取钱包信息
const fetchWalletInfo = async () => {
  try {
    const response = await getAllBalances({ userId: uni.getStorageSync('userId') || 1 }); // 从缓存获取 userId
    balance.value = response.data.accountBalance || 0;
    // 其他余额数据
  } catch (error) {
    console.error('Error fetching wallet info:', error);
  }
}

// 在调用recharge前添加校验
const validateRechargeParams = (params) => {
  if (!params?.userId) throw new Error('userId是必需参数');
  if (!params?.amount || params.amount <= 0) throw new Error('金额必须大于0');
  return true;
};

// 充值方法
const onRecharge = async () => {
  uni.showLoading({ title: '充值中...' });
  
  try {
	   const params = {
	        userId: uni.getStorageSync('userId') || 1,
	        moneyType: ACCOUNT_TYPES.ACCOUNT_BALANCE,
	        amount: selectedAmount.value
	      };
		  console.log("onRecharge-amount:" , selectedAmount.value )
	validateRechargeParams(params); // 参数校验
     await recharge(params);

    
    // 更新本地余额
    balance.value += Number(selectedAmount.value);
    
    // 添加充值记录
    const now = new Date();
    const method = paymentMethods.value.find(p => p.value === selectedPayment.value).name;
    rechargeHistory.value.unshift({
      amount: selectedAmount.value,
      date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`,
      method: method
    });
    
    uni.showToast({
      title: `充值成功 ¥${selectedAmount.value}`,
      icon: 'success'
    });
  } catch (error) {
    uni.showToast({
      title: '充值失败',
      icon: 'error'
    });
  }
}

// 金额变化处理
const handleAmountChange = (event) => {
  // uni-app中event.detail.value获取选中的值
  selectedAmount.value = Number(event.detail.value)
  console.log('当前选中金额:', selectedAmount.value)
  
  // 可以在这里添加其他逻辑，比如：
  // 1. 计算赠送金额
  const bonus = selectedAmount.value >= 100 ? Math.floor(selectedAmount.value * 0.1) : 0
  // 2. 触发父组件事件（如果需要）
  // emit('amount-change', selectedAmount.value)
}

fetchWalletInfo(); // 页面加载时获取钱包信息

function handlePaymentChange(e) {
  selectedPayment.value = e.detail.value
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f8f8f8;
  min-height: 100vh;
  padding: 16px;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.balance-card {
  background-color: #FFD700;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.balance-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
  color: #333;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.card-icon {
  margin-right: 8px;
  font-size: 18px;
}

.card-content {
  padding: 16px;
}

.amount-card {
  border-left: 4px solid #FF6347;
}

.amount-group {
  width: 100%;
}

.amount-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.amount-item:last-child {
  border-bottom: none;
}

.amount-label {
  display: flex;
  align-items: center;
  width: 100%;
}

.amount-radio {
  margin-right: 12px;
}

.amount-info {
  flex: 1;
}

.amount-value {
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.amount-bonus {
  font-size: 13px;
  color: #FF4500;
  margin-top: 4px;
}

.payment-card {
  border-left: 4px solid #1E90FF;
}

.payment-group {
  width: 100%;
}

.payment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.payment-item:last-child {
  border-bottom: none;
}

.payment-label {
  display: flex;
  align-items: center;
  width: 100%;
}

.payment-radio {
  margin-right: 12px;
}

.payment-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.payment-icon {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

.payment-name {
  font-size: 15px;
  color: #333;
}

.history-card {
  border-left: 4px solid #3CB371;
}

.empty-history {
  text-align: center;
  color: #888;
  padding: 20px 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-amount {
  font-size: 16px;
  color: #FF4500;
  font-weight: 600;
}

.history-info {
  text-align: right;
}

.history-date {
  font-size: 13px;
  color: #666;
}

.history-method {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.confirm-btn {
  background-color: #FFD700;
  color: #333;
  border: none;
  border-radius: 25px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  margin: 16px 0;
  transition: all 0.3s;
}

.confirm-btn:active {
  transform: scale(0.98);
}
</style>
