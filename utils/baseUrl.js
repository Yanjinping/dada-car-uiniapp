export function getBaseUrl() {
  try {
    const fromApp =
      typeof getApp === 'function' ? getApp()?.globalData?.BASE_URL : ''
    const fromUni = typeof uni !== 'undefined' ? uni.$BASE_URL : ''
    return (fromApp || fromUni || '').replace(/\/$/, '')
  } catch {
    return ''
  }
}
