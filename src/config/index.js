const config = {
  development: {
    baseURL: 'http://127.0.0.1:8888'
  },
  production: {
    baseURL: 'http://127.0.0.1:8888' // 生产环境地址，后续可以替换为实际的生产环境地址
  }
}

// 根据当前环境获取配置
const env = import.meta.env.MODE || 'development'
const currentConfig = config[env]

export default {
  baseURL: currentConfig.baseURL,
  timeout: 15000, // 请求超时时间
  apiPrefix: '/api' // API前缀，如果需要的话
}
