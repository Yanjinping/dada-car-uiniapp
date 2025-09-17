// utils/location.js
// 统一封装：权限、当前定位、局部定位、历史记录（mp / h5 / app 可用）

const KEY_GLOBAL = 'loc.global';   // {lat, lng, addr, city, ts}
const KEY_HISTORY = 'loc.history'; // Array<HistoryItem>
const HISTORY_MAX = 10;

function getStore(key, defVal = null) {
  try { const s = uni.getStorageSync(key); return s ? JSON.parse(s) : defVal } catch(e){ return defVal }
}
function setStore(key, val) { try { uni.setStorageSync(key, JSON.stringify(val)) } catch(e){} }

/** 平台判定 */
const P = (() => {
  // uni.getSystemInfoSync().uniPlatform: 'mp-weixin' | 'h5' | 'app'...
  let u = 'unknown'
  try { u = (uni.getSystemInfoSync().uniPlatform || '').toLowerCase() } catch(e){}
  return {
    isMP: u.startsWith('mp'),
    isWX: u === 'mp-weixin',
    isH5: u === 'h5',
    isApp: u === 'app'
  }
})();

/** 申请定位权限（各端策略不同；失败不弹窗，只返回状态） */
function ensureAuth() {
  // 小程序端：按小程序规范先 getSetting 再 authorize
  if (P.isMP) {
    return new Promise((resolve) => {
      uni.getSetting({
        success(res){
          const has = !!(res.authSetting && (res.authSetting['scope.userLocation'] || res.authSetting['scope.userFuzzyLocation']))
          if (has) return resolve(true)
          uni.authorize({
            scope: 'scope.userLocation',
            success: () => resolve(true),
            fail: () => resolve(false)
          })
        },
        fail(){ resolve(false) }
      })
    })
  }
  // App/H5：不需要预授权；交给 getLocation 触发系统授权或直接使用
  return Promise.resolve(true)
}

/** 反向地理（按需对接你的服务；默认空） */
async function reverseGeocode(lat, lng) {
  // TODO：接入腾讯/高德/百度逆地理
  return { address: '', city: '', province: '' }
}

/** 获取当前定位（带5分钟缓存；fresh=true 强制刷新） */
export async function getCurrentLocation(fresh = false) {
  const cache = getStore(KEY_GLOBAL)
  if (!fresh && cache && Date.now() - (cache.ts||0) < 5*60*1000) return cache

  const ok = await ensureAuth()
  if (!ok) throw new Error('NO_AUTH')

  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: P.isWX ? 'gcj02' : 'wgs84', // 微信返回 gcj02 更稳；其他端用默认 wgs84
      isHighAccuracy: true,
      highAccuracyExpireTime: 8000,
      success: async (res) => {
        const lat = res.latitude, lng = res.longitude
        const geo = await reverseGeocode(lat, lng)
        const data = { lat, lng, addr: geo.address || '', city: geo.city || '', ts: Date.now() }
        setStore(KEY_GLOBAL, data)
        resolve(data)
      },
      fail: (err) => {
        // H5 常见问题：不在 HTTPS/用户拒绝/浏览器不支持
        reject(err)
      }
    })
  })
}

/** 地图选点（H5 端视环境能力做兜底） */
export function chooseLocation() {
  // 绝大多数场景下直接用 uni.chooseLocation（App/小程序原生支持）
  return new Promise((resolve, reject) => {
    const call = () => uni.chooseLocation({
      success(res){
        const data = {
          lat: res.latitude,
          lng: res.longitude,
          addr: res.address || res.name || '',
          name: res.name || '',
          ts: Date.now()
        }
        pushHistory(data)
        resolve(data)
      },
      fail(err){ reject(err) }
    })

    if (!P.isH5) return call()

    // H5：要求 HTTPS 与浏览器支持；有些环境不弹系统地图，需要兜底
    try {
      call()
    } catch (e) {
      // 兜底：退化为“用当前定位 + 简单输入地址”
      getCurrentLocation().then(loc => {
        const data = { lat: loc.lat, lng: loc.lng, addr: loc.addr || '当前位置', name: '当前位置', ts: Date.now() }
        pushHistory(data)
        resolve(data)
      }).catch(() => reject(new Error('H5_CHOOSE_LOCATION_UNSUPPORTED')))
    }
  })
}

/** 历史记录 */
export function getHistory() {
  const list = getStore(KEY_HISTORY, [])
  return Array.isArray(list) ? list : []
}
export function pushHistory(item) {
  const list = getHistory()
  const id = `${(+item.lat).toFixed(6)},${(+item.lng).toFixed(6)}`
  const filtered = list.filter(it => it._id !== id)
  const now = { ...item, _id: id, lastUse: Date.now() }
  const next = [now, ...filtered].slice(0, HISTORY_MAX)
  setStore(KEY_HISTORY, next)
}
export function clearHistory() { setStore(KEY_HISTORY, []) }

/** 全局缓存读写（不触发定位） */
export function readGlobalCache() { return getStore(KEY_GLOBAL, null) }
export function writeGlobalCache(obj) { setStore(KEY_GLOBAL, { ...(obj||{}), ts: Date.now() }) }

/** 引导用户去设置里打开定位（小程序 & App 有效；H5 忽略） */
export function openLocationSetting() {
  if (P.isH5) return Promise.resolve(false)
  return new Promise((resolve) => {
    uni.openSetting({
      success(res){
        const ok = !!(res.authSetting && (res.authSetting['scope.userLocation'] || res.authSetting['scope.userFuzzyLocation']))
        resolve(ok)
      },
      fail(){ resolve(false) }
    })
  })
}
