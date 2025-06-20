import axios from 'axios'
// 导入类型
import type { AxiosInstance } from 'axios'
import type { HYRequestConfig } from './type'
import { ElMessage } from 'element-plus'

// 拦截器: 蒙版Loading/token/修改配置

/**
 * 两个难点:
 *  1.拦截器进行精细控制
 *    > 全局拦截器
 *    > 实例拦截器
 *    > 单次请求拦截器
 *
 *  2.响应结果的类型处理(泛型)
 */

class HYRequest {
  // 指定为AxiosInstance
  instance: AxiosInstance

  // request实例 => axios的实例
  // 传入config
  constructor(config: HYRequestConfig) {
    this.instance = axios.create(config)

    // 每个instance实例都添加拦截器
    // this.instance.interceptors.request.use(
    //   // 请求成功拦截
    //   (config) => {
    //     // loading/token
    //     return config
    //   },
    //   // 请求失败拦截
    //   (err) => {
    //     return err
    //   }
    // )
    // this.instance.interceptors.response.use(
    //   // 响应成功拦截
    //   (res) => {
    //     const t = res.data
    //     if (t.code === 401) {
    //       ElMessage.error(t.msg)
    //       return null
    //     } else return res.data
    //   },
    //   // 响应失败拦截
    //   (err) => {
    //     return err
    //   }
    // )
  }

  // 封装网络请求的方法
  // T => IHomeData
  request<T = any>(config: HYRequestConfig<T>) {
    // 单次请求的成功拦截处理
    if (config.interceptors?.requestSuccessFn) {
      config = config.interceptors.requestSuccessFn(config)
    }

    // 返回Promise
    return new Promise<T>((resolve, reject) => {
      this.instance
        .request<any, T>(config)
        .then((res) => {
          // 单词响应的成功拦截处理
          if (config.interceptors?.responseSuccessFn) {
            res = config.interceptors.responseSuccessFn(res)
          }
          resolve(res)
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  get<T = any>(config: HYRequestConfig<T>) {
    return this.request({ ...config, method: 'GET' })
  }
  post<T = any>(config: HYRequestConfig<T>) {
    return this.request({ ...config, method: 'POST' })
  }
  delete<T = any>(config: HYRequestConfig<T>) {
    return this.request({ ...config, method: 'DELETE' })
  }
  patch<T = any>(config: HYRequestConfig<T>) {
    return this.request({ ...config, method: 'PATCH' })
  }
}

export default HYRequest
