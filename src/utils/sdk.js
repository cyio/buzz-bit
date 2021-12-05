import { goAuth } from '@/api/buzz.ts'
import AppConfig from '@/config/'
import MetaIdJs from "metaidjs"

let singleton

export default function SDKInit() {
  if (singleton) return singleton
  singleton = new Promise((resolve, reject) => {
    if (window.appMetaIdJs) {
      // 定义新方法，兼容公开 SDK 与 showapp 内创建节点方法
      window.appMetaIdJs.addProtocolNode_ = (config) => {
        window.addProtocolNodeCallBack_ = (res) => {
          if (typeof res === 'string') {
            res = JSON.parse(res)
          }
          console.log('callback res: ', res)
          config.callback(res)
        }
        console.log('before inApp send: ', config)
        window.appMetaIdJs.sendMetaDataTx(config.accessToken, JSON.stringify(config), 'addProtocolNodeCallBack_')
      }
      window.__metaIdJs = window.appMetaIdJs
      resolve(true)
      return
    }
    if (window.__metaIdJs?.isInjectMainFrame) {
      console.log('sdk has cached')
      resolve(true)
      return
    }
    console.log('before new MetaIdJs', performance.now() / 1000)
    // window.__metaIdJsLoading = true
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
        if (code === 201) {
          goAuth()
        }
        reject(code)
      }
    })
  })
  return singleton
}
