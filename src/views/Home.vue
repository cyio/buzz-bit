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
    <Uploader ref="uploader" @change="handleMetafileChange" @close="handleMetafileClose" />
  </div>
</template>

<script>
// @ is an alias to /src
import Uploader from "@/components/Uploader.vue";
import MetaIdJs from "metaidjs"
import { goAuth, getToken, queryMetaIdData } from '@/api/metasv-buzz.ts'
import AppConfig from '@/config/metasv-buzz'
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
      attachments: []
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
    send() {
      const buzzData = {
        createTime: new Date().getTime(),
        content: this.content,
        contentType: 'text/plain',
        attachments: this.attachments.map((item, index) => { return `![metafile](${index})` }),
        // mention: [],
      }
      const config = {
        nodeName: "SimpleMicroblog",
        metaIdTag: "metaid",
        brfcId: "9e73d8935669",
        accessToken: this.accessToken,
        encrypt: 0,
        payCurrency: "BSV",
        // payTo: [
        //   {
        //     amount: 2000,
        //     address: "1ad59XtDJMeaMAuXasFad1EU4h",
        //   },
        // ],
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
      console.log('loaded', performance.now())
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
    async getBuzzList(type) {
      // if (this.loadingMore || (type === 'user' && !this.userInfo.following.length)) return
      const params = {
        find: {
          $and: [
            {
              $or: [
                // {
                //   parentNodeName: 'ShowText'
                // },
                {
                  parentNodeName: 'SimpleMicroblog',
                  encrypt: '0',
                },
                {
                  parentNodeName: 'SimpleRePost'
                },
                {
                  parentNodeName: 'metanote',
                  'data.isPrivate': 0
                },
              ],
            },
          ],
          metaId: AppConfig.metaIdTag,
          encrypt: '0',
          isNew: true,
        },
        sort: {
          timestamp: -1
        },
        // skip: this.pageNum,
        // limit: this.pageSize
      }
      if (type === 'user') {
        params.find['$or'] = [
          { rootTxId: this.userInfo.metaId },
        ]
        const following = this.userInfo.following
        // following.push(this.userInfo.metaId)
        following.forEach(user => {
          params.find['$or'].push({ rootTxId: user })
        })
      } else {
        delete params.$or
      }
      // this.loadingMore = true
      // this.NProgress.start()
      const res = await queryMetaIdData(params)
      console.log('query params', params, res)
      // if (res?.code === 200) {
      //   const list = res.result.data
      //   // 是否已经没有更多了
      //   if (list.length < this.pageSize) {
      //     this.isEnd = true
      //   }
      //   this.metaBuzzList = this.metaBuzzList.concat(list)
      //   window.scrollTo({
      //     top: window.pageYOffset - 10,
      //     behavior: 'smooth'
      //   })
      //   this.NProgress.done()
      //   setTimeout(() => {
      //     this.loadingMore = false
      //   }, 5000)
      // } else {
      //   this.$toasted.error('获取数据失败.')
      //   this.loadingMore = false
      //   this.NProgress.remove()
      // }
    },
    handleMetafileChange(files) {
      this.attachments = files
    },
    handleMetafileClose() {
      this.attachments = []
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