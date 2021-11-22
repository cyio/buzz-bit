<template>
  <div class="home">
    <div class="input-area">
      <van-field
        v-model="content"
        rows="2"
        autosize
        label=""
        type="textarea"
        :placeholder="t('post.inputPlaceholder')"
        clearable
      />
      <div class="word-count">{{content.length || ''}}</div>
    </div>
    <div class="input-operation">
      <div class="text-option">
        <!-- <input type="checkbox" id="useEncrypt" v-model="useEncrypt"> -->
        <!-- <label for="useEncrypt">私密</label> -->
        <input type="checkbox" id="showImgSelect" v-model="showImgSelect">
        <label for="showImgSelect">{{t('btn.image')}}</label>
        <input type="checkbox" id="showFileSelect" v-model="showFileSelect">
        <label for="showFileSelect">{{t('btn.file')}}</label>
      </div>
      <van-button color="#1989fa" @click="send" size="small"
        :disabled='!isSDKLoaded || content === ""' class="send"
        :loading="!isSDKLoaded"
      >{{t('btn.send')}}</van-button>
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
import { getToken } from '@/api/buzz.ts'
import AppConfig from '@/config/'
import { Storage } from '@/utils/index';
import { mapState } from 'vuex'
import mime from 'mime-types'
import { Field } from 'vant'
import { useI18n } from 'vue-i18n-composable/src/index'

function setLocal(key, val) {
  return window.localStorage.setItem(key, val)
}

export default {
  name: "Home",
  components: {
    Uploader,
    FileUploader,
    BuzzListContainer,
    [Field.name]: Field,
  },
  data() {
    return {
      code: '',
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
  setup() {
    return {
      ...useI18n(),
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
        attachments: this.attachments.map((item, index) => {
          let ext = mime.extension(item.fileType)
          if (ext === false) {
            let tmp = item.fileName.split('.')
            ext = tmp[tmp.length - 1]
          }
          const extStr = /webp|jpg|png|jpeg|gif/.test(ext) ? '' : `.${ext}`
          return `![metafile](${index})${extStr}`
        }),
        // mention: [],
      }
      const feeMap = this.computeAppFees()
      const payTo = Object.keys(feeMap).map(key => ({
        amount: feeMap[key],
        address: this.$chargeAddress[key]
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
      window.__metaIdJs.addProtocolNode(config);
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
        this.content += `#分享文件 ${fileName}`
        console.log(txId)
      }
    },
  },
  computed: {
    ...mapState({
      user: 'user',
      accessToken: 'accessToken',
      isSDKLoaded: 'isSDKLoaded'
    }),
    isLogined() {
      return !!this.accessToken
    }
  },
  created() {
  },
  watch: {
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
    position: relative;
    .word-count {
      position: absolute;
      right: 10px;
      bottom: 10px;
      font-size: 12px;
      color: gray;
    }
    .van-field {
      border: 1px solid #e4e0e0;
      border-radius: 6px;
    }
    // .send {
    // }
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
<style>
.van-field__control {
  color: #0f1419;
  font-size: 16px;
}
</style>