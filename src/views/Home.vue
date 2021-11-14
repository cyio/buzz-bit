<template>
  <div class="home">
    <div class="input-area">
      <textarea
        v-model="content"
        placeholder="输入文字"
        rows="5" cols="50"
      ></textarea><br>
    </div>
    <div class="input-operation">
      <div class="text-option">
        <input type="checkbox" id="useEncrypt" v-model="useEncrypt">
        <label for="useEncrypt">私密</label>
        <input type="checkbox" id="showImgSelect" v-model="showImgSelect">
        <label for="showImgSelect">发图</label>
        <input type="checkbox" id="showFileSelect" v-model="showFileSelect">
        <label for="showFileSelect">分享文件</label>
      </div>
      <van-button color="#1989fa" @click="send" size="small"
        :disabled='!isLoaded || content === ""' class="send"
        :loading="!isLoaded"
      >发送</van-button>
    </div>
    <uploader v-show="showImgSelect" ref="uploader" @change="handleMetafileChange" />
    <file-Uploader v-show="showFileSelect" ref="uploader" @change="handleMetafileChange" />
    <buzz-list-container
      scene="priv"
      :user="user"
      v-if="user.metaId"
      :lastBuzzTime="lastBuzzTime"
    />
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";
import FileUploader from "@/components/FileUploader.vue";
import BuzzListContainer from "@/components/BuzzListContainer.vue";
import MetaIdJs from "metaidjs"
import { goAuth, getToken } from '@/api/metasv-buzz.ts'
import AppConfig from '@/config/metasv-buzz'
import { Storage } from '@/utils/index';
import { mapState } from 'vuex'

function getLocal(key) {
  return window.localStorage.getItem(key)
}
function setLocal(key, val) {
  return window.localStorage.setItem(key, val)
}

export default {
  name: "Home",
  components: {
    Uploader,
    FileUploader,
    BuzzListContainer,
  },
  data() {
    return {
      code: '',
      isLoaded: false,
      refreshToken: '',
      // accessToken: '',
      content: '',
      metaIdJs: null,
      attachments: [],
      buzzListData: [],
      useEncrypt: false,
      showImgSelect: false,
      showFileSelect: false,
      lastBuzzTime: +new Date(),
    }
  },
  methods: {
    updateAccessToken(res) {
      this.accessToken = res.accessToken
      this.refreshToken = res.refreshToken
      setLocal('refresh_token', res.refreshToken)
      setLocal('access_token', res.accessToken)
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
    updateAttachmentsEncrypt() {
      if (this.useEncrypt) {
        this.attachments.forEach(i => i.encrypt = 1)
      } else {
        this.attachments.forEach(i => delete i.encrypt)
      }
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
      this.updateAttachmentsEncrypt()
      const config = {
        nodeName: "SimpleMicroblog",
        metaIdTag: "metaid",
        brfcId: "9e73d8935669",
        accessToken: this.accessToken,
        encrypt: +this.useEncrypt,
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
            this.lastBuzzTime = +new Date()
            // this.getCurBuzzList()
          } else {
            new Error(res.data.message);
          }
        },
        onCancel(res) {
          console.log('cancel: ', res)
        }
      }
      console.log(config)
      __metaIdJs.addProtocolNode(config);
    },
    getUser() {
      const userCache = Storage.getObj('user') || '{}'
      if (userCache.metaId) {
        this.$store.commit('SET_USER', userCache);
        return
      }
      window.__metaIdJs.getUserInfo({
        accessToken: this.accessToken,
        callback: (res) => {
          if (res.code === 200) {
            this.$store.commit('SET_USER', res.data);
          } else {
            console.log('get user error: ', res)
          }
        },
      })
    },
    handleMetafileChange(files) {
      this.attachments = files
      if (this.showFileSelect && this.attachments.length) {
        let { fileName, data: txId } = this.attachments[0]
        let baseUrl = 'https://buzzbit.vercel.app/'
        // if (isLocal) {
        // }
        // this.content += `分享文件：${fileName} ${baseUrl}/#/preview/${txId}`
        this.content += `#分享文件 ${fileName}`
      }
    },
    initSDK(hasUserInfo) {
      console.log('before new MetaIdJs', performance.now() / 1000)
      window.__metaIdJs = new MetaIdJs({
        oauthSettings: {
          clientId: AppConfig.oauthSettings.clientId,
          clientSecret: AppConfig.oauthSettings.clientSecret,
          redirectUri: ''
        },
        onLoaded: () => {
          console.log('metaidjs loaded', performance.now() / 1000)
          this.isLoaded = true
          if (!hasUserInfo) {
            this.getUser()
          }
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
  computed: {
    ...mapState({
      user: 'user',
      accessToken: 'accessToken'
    }),
    isLogined() {
      return !!this.accessToken
    }
  },
  created() {
    // if (getLocal('access_token')) {
    //   this.accessToken = getLocal('access_token')
    // }
    // if (getLocal('refresh_token')) {
    //   this.refreshToken = getLocal('refresh_token')
    // }
  },
  watch: {
    // 是否存在 token
    //  是否存在 user cache
    //    并行初始化 sdk
    //  sdk 是否初始化
    'isLogined': {
      handler: function(val) {
        if (val) {
          const userCache = Storage.getObj('user') || '{}'
          if (userCache.metaId) {
            this.$store.commit('SET_USER', userCache);
            if (window.__metaIdJs) {
              this.isLoaded = true
            } else {
              this.initSDK(false)
            }
          } else {
            this.initSDK()
          }
        } else {
          this.initSDK()
        }
      },
      immediate: true
    }
  },
  mounted() {
  }
}
</script>

<style lang="scss" scoped>
.home {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  .userinfo {
    display: flex;
    margin-bottom: 12px;
    .username {
      margin-right: 10px;
      min-width: 140px;
    }
  }
  .input-area {
    display: flex;
    margin-bottom: 10px;
    textarea {
      width: 100%;
    }
    .send {
    }
  }
  .input-operation {
    display: flex;
    justify-content: space-between;
    .send {
      width: 80px;
    }
  }
  .list-nav {
    display: flex;
    .item {
      margin-right: 12px;
    }
  }
  .loading {
    margin-bottom: 12px;
    text-align: center;
  }
}
</style>