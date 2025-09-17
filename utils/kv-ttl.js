export function setWithTTL(key, val, ttlMs=10*60*1000){
  uni.setStorageSync(key, JSON.stringify({ v: val, e: Date.now()+ttlMs }))
}
export function getWithTTL(key){
  try{
    const raw = uni.getStorageSync(key); const o = JSON.parse(raw||'')
    if (!o || !o.e || Date.now()>o.e) { uni.removeStorageSync(key); return null }
    return o.v
  }catch{ return null }
}
