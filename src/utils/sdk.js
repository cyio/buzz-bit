import { goAuth } from '@/api/buzz.ts'
import { Storage } from '@/utils/index';
import AppConfig from '@/config/'
import MetaIdJs from "metaidjs"

let singleton

export default function SDKInit() {
  if (singleton) return singleton
  singleton = new Promise((resolve, reject) => {
    // const userCache = Storage.getObj('user') || '{}'
    // if (userCache.metaId && window.__metaIdJs?.isInjectMainFrame) {
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
      }
    })
  })
  return singleton
}
