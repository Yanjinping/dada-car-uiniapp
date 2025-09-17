// stores/location.js
import { defineStore } from 'pinia'
import { getCurrentLocation, readGlobalCache, writeGlobalCache, getHistory, pushHistory, clearHistory } from '@/utils/location.js'

export const useLocationStore = defineStore('location', {
  state: () => ({
    // 全局当前位置（供全站读）
    current: readGlobalCache() || null,
    // 局部位置（当前页面/业务临时选择）
    scoped: null,
    // 历史
    history: getHistory(),
    // 加载状态
    loading: false,
    error: ''
  }),
  actions: {
    async refreshGlobal(force = false) {
      this.loading = true; this.error = ''
      try {
        const loc = await getCurrentLocation(!!force)
        this.current = loc
        writeGlobalCache(loc)
      } catch(e) {
        this.error = e && e.message || '定位失败'
      } finally {
        this.loading = false
      }
    },
    setScoped(loc) { this.scoped = loc || null },
    clearScoped(){ this.scoped = null },
    useHistoryItem(item) {
      this.scoped = item
      pushHistory(item)
      this.history = getHistory()
    },
    reloadHistory() { this.history = getHistory() },
    clearHistoryAll() { clearHistory(); this.reloadHistory() }
  },
  getters: {
    // 页面实际使用的位置优先级：局部 > 全局
    effectiveLocation(state) {
      return state.scoped || state.current
    }
  }
})
