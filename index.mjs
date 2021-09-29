import MetaIdJs from "metaidjs"

const CLIENT_ID = 'e6d94fe3-69ab-43a9-8988-3255e5957864'
const CLIENT_SECRET = 'af22ad2f-8bc8-45c2-b155-bd4ed6ee97bd'
const ACCESS_TOKEN = '8ae16a89-5981-490c-ab4d-cc3da81711cf'

const metaIdJs = new MetaIdJs({
  oauthSettings: {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    redirectUri: ''
  },
  onLoaded: () => {
    onLoaded()
  },
  onError: (res) => {
    console.log(res)
  }
})

function onLoaded() {
  metaIdJs.getUserInfo(JSON.stringify({
    accessToken: ACCESS_TOKEN,
    callback: 'handleUserInfo',
  }))
}

function handleUserInfo(res) {
  console.log(res)
}
