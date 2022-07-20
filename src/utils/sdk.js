import { goAuth } from '@/api/buzz.ts'
import AppConfig from '@/config/'
import MetaIdJs from "metaidjs"

let singleton

// 调用：window.__metaIdJs.addProtocolNode_(config);
export default function SDKInit() {
  if (singleton) return singleton
  singleton = new Promise((resolve, reject) => {
    if (window.appMetaIdJs) {
      // 定义新方法，兼容公开 SDK 与 showapp 内创建节点方法
      window.__metaIdJs = window.appMetaIdJs || {}
      window.__metaIdJs.addProtocolNode_ = (config) => {
        window.addProtocolNodeCallBack_ = (res) => {
          if (typeof res === 'string') {
            res = JSON.parse(res)
          }
          console.log('callback res: ', res)
          config.callback(res)
        }
        // window.addProtocolNodeOnCancel_ = (res) => {
        //   if (typeof res === 'string') {
        //     res = JSON.parse(res)
        //   }
        //   console.log('cancel res: ', res)
        //   config.onCancel(res)
        // }
        console.log('before inApp send: ', config)
        if (window.localStorage.getItem('needConfirm') === 'false') {
          let totalAmount = config.payTo.reduce((acc, cur) => acc + cur.amount, 0)
          console.log('neecConfirm amount', totalAmount)
          if (totalAmount < 2000) {
            config.needConfirm = false
          }
        }
        window.appMetaIdJs.sendMetaDataTx(
          config.accessToken,
          JSON.stringify(config),
          'addProtocolNodeCallBack_'
          // 'addProtocolNodeOnCancel_' // 会报错
        )
      }
      window.__metaIdJs.eciesDecryptData_ = (config, isFile) => {
        window.eciesDecryptDataCallBack_ = (res) => {
          console.log('callback res raw: ', res)
          if (!isFile && typeof res === 'string') {
            res = JSON.parse(res)
          }
          console.log('callback res: ', res)
          config.callback(res)
        }
        console.log(config.data)
        window.appMetaIdJs.decryptData(
          config.accessToken,
          config.data,
          'eciesDecryptDataCallBack_'
        )
      }
      window.__metaIdJs.getUserInfo_ = (config, isFile) => {
        window.getUserInfoCallBack_ = (res) => {
          console.log('callback res raw: ', res)
          if (!isFile && typeof res === 'string') {
            res = JSON.parse(res)
          }
          console.log('callback res: ', res)
          config.callback(res)
        }
        console.log(config.data)
        window.appMetaIdJs.getUserInfo(
          AppConfig.oauthSettings.clientId,
          AppConfig.oauthSettings.clientSecret,
          'getUserInfoCallBack_'
        )
      }
      resolve(true)
      return
    } else {
      if (window.__metaIdJs?.isInjectMainFrame) {
        console.log('sdk has cached')
        resolve(true)
        return
      }
      console.log('before new MetaIdJs', performance.now() / 1000)
      window.__metaIdJs = new MetaIdJs({
        oauthSettings: {
          clientId: AppConfig.oauthSettings.clientId,
          clientSecret: AppConfig.oauthSettings.clientSecret,
          redirectUri: AppConfig.oauthSettings.redirectUri,
        },
        onLoaded: () => {
          console.log('metaidjs loaded', performance.now() / 1000)
          resolve(true)
        },
        onError: (res) => {
          console.log(res)
          const { code } = res
          if (code === 201 || code === 204) {
            goAuth()
          }
          reject(code)
        }
      })
      // 设置成新方法，保留原方法
      window.__metaIdJs.addProtocolNode_ = window.__metaIdJs.addProtocolNode
      window.__metaIdJs.eciesDecryptData_ = window.__metaIdJs.eciesDecryptData
      window.__metaIdJs.getUserInfo_ = window.__metaIdJs.getUserInfo
    }
  })
  return singleton
}
