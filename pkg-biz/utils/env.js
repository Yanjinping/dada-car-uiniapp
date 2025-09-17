// utils/env.js
const ENV = 'dev' // 改成 'prod' 就行

const config = {
  dev: {
    baseUrl: 'http://xacfdf6a.natappfree.cc/api'
  },
  prod: {
    baseUrl: 'https://api.dadacar.com/api'
  }
}

export function getBaseUrl() {
  return config[ENV].baseUrl
}
