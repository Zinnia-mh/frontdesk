import HYRequest from './request'
const hyRequest = new HYRequest({
    baseURL: BASE_URL,
    timeout: TIME_OUT,
    // interceptors: {
    //   requestSuccessFn: (config) => {
    //     // 请求拦截
    //     // 每个请求都自动携带token
    //     const token = localCache.getCache(LOGIN_TOKEN)
    //     if (config.headers && token) {
    //       config.headers.token = token
    //     }
    //     return config
    //   }
    // }
  })
  
  export default hyRequest