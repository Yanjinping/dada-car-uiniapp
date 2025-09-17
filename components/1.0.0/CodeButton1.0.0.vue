<template>
  <button class="code-btn" :disabled="counting || disabled" @click="send">
    {{ counting ? `${countdown}s` : '获取验证码' }}
  </button>
</template>

<script setup>
import { ref } from 'vue';
import uniToast from '@/utils/uniToast.js';

const props = defineProps({
  phone: { type: String, required: true },
  disabled: Boolean,
  duration: { type: Number, default: 60 },
});
const emit = defineEmits(['send']);

const countdown = ref(0);
const counting = ref(false);
let timer = null;

async function send() {
  if (!/^1\d{10}$/.test(props.phone)) {
    return uniToast('请输入正确手机号');
  }
  const ok = await emit('send');
  if (ok === false) return;
  startTimer();
}

function startTimer() {
  countdown.value = props.duration;
  counting.value = true;
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      counting.value = false;
    }
  }, 1000);
}
</script>
