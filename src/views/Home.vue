<template>
  <div class="home">
    <div class="userinfo">
      <button @click="auth" class="auth">登陆/切换帐号</button>
      <div class="username"> 当前用户：{{user.name || '...'}}</div>
    </div>
    <div class="status">{{isLoaded ? '': '正在加载...'}}</div><br>
    <div class="input-area">
      <textarea
        v-model="content"
        placeholder="输入文字"
        rows="5" cols="50"
      ></textarea><br>
      <div class="btn-area">
        <button @click="send" :disabled='!isLoaded' class="send">发送</button>
      </div>
    </div>
    <!-- <img alt="Vue logo" src="../assets/logo.png" /> -->
    <Uploader ref="uploader" @change="handleMetafileChange" />
    <!-- <button @click="getBuzzList" class="send">刷新列表</button> -->
    <BuzzList :buzzListData="buzzListData" />
  </div>
</template>

<script>
// @ is an alias to /src
import Uploader from "@/components/Uploader.vue";
import BuzzList from "@/components/BuzzList.vue";
import MetaIdJs from "metaidjs"
import { goAuth, getToken, getBuzzList } from '@/api/metasv-buzz.ts'
import AppConfig from '@/config/metasv-buzz'
import { isProd } from '@/utils/index';
// import { setLocal } from '@/utils/storage';

const CLIENT_ID = 'e6d94fe3-69ab-43a9-8988-3255e5957864'
const CLIENT_SECRET = 'af22ad2f-8bc8-45c2-b155-bd4ed6ee97bd'
const ACCESS_TOKEN = '4bf0d693-970b-4e21-a12a-ecb876d7f186'
// TODO token 流程是什么？为什么会提示失效
function getLocal(key) {
  return window.localStorage.getItem(key)
}
function setLocal(key, val) {
  return window.localStorage.setItem(key, val)
}
function getUrlParameterByName(name, url) {
  if (!url) url = window.location.href;
  // name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  const results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

export default {
  name: "Home",
  components: {
    Uploader,
    BuzzList
  },
  data() {
    return {
      code: '',
      isLoaded: false,
      refreshToken: '',
      accessToken: '',
      content: '',
      metaIdJs: null,
      user: {},
      attachments: [],
      buzzListData: []
    }
  },
  methods: {
    updateAccessToken(res) {
      this.accessToken = res.accessToken
      this.refreshToken = res.refreshToken
      setLocal('refresh_token', res.refreshToken)
      setLocal('access_token', res.accessToken)
    },
    getAccessToken() {
      return getToken({
        'grant_type': 'authorization_code',
        code: this.code,
        // 'client_id': id,
        'redirect_uri': AppConfig.oauthSettings.redirectUri,
        'scope': 'app',
        'client_id': AppConfig.oauthSettings.clientId,
        'client_secret': AppConfig.oauthSettings.clientSecret
      }).then(res => {
        if (res.access_token) {
          this.updateAccessToken({
            accessToken: res.access_token,
            refreshToken: res.refresh_token
          })
          // window.location.reload()
        } else if (res.error_description) {
          this.$toasted.error(res.error_description)
        }
      })
    },
    async refreshAccessToken() {
      await getToken({
        'grant_type': 'refresh_token',
        // 'client_id': id,
        // 'redirect_uri': AppConfig.oauthSettings.redirectUri,
        // 'scope': 'app',
        'refresh_token': this.refreshToken,
        'client_id': AppConfig.oauthSettings.clientId,
        'client_secret': AppConfig.oauthSettings.clientSecret
      }).then(res => {
        if (res.access_token) {
          // this.updateAccessToken(res.access_token)
          this.updateAccessToken({
            accessToken: res.access_token,
            refreshToken: res.refresh_token
          })
          // window.location.reload()
        } else if (res.error_description) {
          window.localStorage.clear()
          console.log('get token error: ', res.error_description)
          // this.$toasted.error(res.error_description)
        }
      })
    },
    computeAppFees() {
      const postFee = 1000
      const mineFeeRate = 0.5
      const postImgFeeRate = 0.05
      const compressFeeRate = 0.005
      const imgs = this.$refs.uploader.previewImages
      const fileSize = imgs.reduce((acc, cur) => acc + cur.output.size, 0)
      const savedSize = imgs.reduce((acc, cur) => acc + cur.input.size - cur.output.size, 0)
      // 基础体积费用 + 节省体积费用
      const basicSizeFee = Math.floor(fileSize * mineFeeRate * postImgFeeRate)
      const savedSizeFee = Math.floor(savedSize * mineFeeRate * compressFeeRate)
      console.log('fee', { postFee, basicSizeFee, savedSizeFee})
      return { postFee, basicSizeFee, savedSizeFee }
    },
    send() {
      const buzzData = {
        createTime: new Date().getTime(),
        content: this.content,
        contentType: 'text/plain',
        attachments: this.attachments.map((item, index) => { return `![metafile](${index})` }),
        // mention: [],
      }
      const chargeAddress = {
        'postFee': '18H4SRi4nh9yg6Tr8M24CTtsveqzmFmJxM',
        'basicSizeFee': '13fk1eut5jjefQ7HdgY34ANm6shBnVzUVc',
        'savedSizeFee': '14nXduvCiHx3hEm6dmGKwJnth2iZVX6YF1'
      }
      const feeMap = this.computeAppFees()
      const payTo = Object.keys(feeMap).map(key => ({
        amount: feeMap[key],
        address: chargeAddress[key]
      }))
      const config = {
        nodeName: "SimpleMicroblog",
        metaIdTag: "metaid",
        brfcId: "9e73d8935669",
        accessToken: this.accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        payTo,
        path: "/Protocols/SimpleMicroblog",
        dataType: "application/json",
        attachments: this.attachments,
        // attachments: [
          // {
            // fileName: "PC0b3c7d089fa7d55720d6cf.png",
            // fileType: "image/png",
            // data: "89504ae426082",
            // encrypt: 0,
          // },
        // ],
        data: JSON.stringify(buzzData),
        needConfirm: false,
        // checkOnly: true, // dev
        callback: (res) => {
          // 确认付款完后的回调
          if (res.code === 200) {
            console.log(res.data.txId);
            this.content = ''
            this.attachments = []
            this.$refs.uploader.clear()
            this.getBuzzList()
            // do something...
          } else {
            new Error(res.data.message);
            // do something...
          }
        },
        onCancel(res) {
          console.log('cancel: ', res)
        }
      }
      console.log(config)
      __metaIdJs.sendMetaDataTx(config);
    },
    onLoaded() {
      console.log('metaidjs loaded', performance.now() / 1000)
      this.isLoaded = true
      this.getUser()
    },
    auth() {
      goAuth()
    },
    getUser() {
      window.__metaIdJs.getUserInfo({
        accessToken: this.accessToken,
        // callback: 'handleUserInfo',
        callback: (res) => {
          if (res.code === 200) {
            console.log('userinfo', res.data)
            this.user = res.data
            this.getBuzzList()
          } else {
            console.log('get user error: ', res)
          }
          // handleUserInfo(res)
          // if (res.code === 200) {
            // console.log(res)
          // }
        },
      })
    },
    getBuzzList() {
      const params = {
        Protocols: ['SimpleMicroblog'],
        metaId: this.user.metaId,
        page: '1',
        pageSize: '10',
        timestamp: 0
      }
      getBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.buzzListData = res.data.results?.items || []
        }
      })
    },
    handleMetafileChange(files) {
      this.attachments = files
    }
  },
  computed: {
    isLogined() {
      return !!this.accessToken
    }
  },
  async created() {
    // this.code = this.$route.query.code
    this.code = getUrlParameterByName('code')
    // debugger
    // if (this.isLogined && this.refreshToken) {
    //   this.refreshAccessToken()
    // }
    if (this.$route.path === '/') {
      if (this.code) {
        await this.getAccessToken()
        location.href = '/#'
      }
      // this.$router.push({ path: '/', query: { type: this.isLogined ? 'user' : 'new' } })
    }
    if (getLocal('access_token')) {
      this.accessToken = getLocal('access_token')
    }
    if (getLocal('refresh_token')) {
      this.refreshToken = getLocal('refresh_token')
    }
    if (!this.isLogined) {
      goAuth()
      return
    }
  },
  watch: {
    'isLogined': function(val) {
      // MetaIdJs 初始化太慢，进行缓存，如果 AppConfig 发生变化，请手动刷新页面使生效
      if (window.__metaIdJs) {
        return this.onLoaded()
      }
      if (!val) return
      console.log('before new MetaIdJs', performance.now() / 1000)
      window.__metaIdJs = new MetaIdJs({
        oauthSettings: {
          clientId: AppConfig.oauthSettings.clientId,
          clientSecret: AppConfig.oauthSettings.clientSecret,
          redirectUri: ''
        },
        onLoaded: () => {
          this.onLoaded()
        },
        onError: (res) => {
          console.log(res)
          const { code } = res
          if (code === 201) {
            goAuth()
          }
        }
      })
    }
  },
  mounted() {
    // this.getBuzzList()
  }
};
</script>

<style lang="stylus">
.home {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  .userinfo {
    display: flex;
    .username {
      margin-left: 10px;
    }
  }
  .input-area {
    display: flex;
    textarea {
      width: 70%;
      margin-right: 15px;
    }
    .btn-area {
      width: 20%;
      display: flex;
      align-items: flex-end;
    }
    .send {
      width: 100%;
      height: 40px;
    }
  }
}
</style>