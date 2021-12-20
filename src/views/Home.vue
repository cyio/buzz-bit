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
        @keydown="handleCmdEnter($event)"
      />
      <div class="word-count">{{content.length || ''}}</div>
    </div>
    <div class="input-operation">
      <div class="text-option">
        <div class="item">
          <input type="checkbox" id="useEncrypt" v-model="useEncrypt">
          <label for="useEncrypt">{{t('btn.private')}}</label>
        </div>
        <div class="item">
          <input type="checkbox" id="showImgSelect" v-model="showImgSelect">
          <label for="showImgSelect">{{t('btn.image')}}</label>
        </div>
        <div class="item">
          <input type="checkbox" id="showFileSelect" v-model="showFileSelect">
          <label for="showFileSelect">{{t('btn.file')}}</label>
        </div>
      </div>
      <van-button color="var(--theme-color)" @click="send" size="small"
        :disabled='!isSDKLoaded || content === "" || isSending' class="send"
        :loading="!isSDKLoaded || isSending"
      >
        <!-- {{t('btn.send')}} -->
        <van-icon name="guide-o" size="25" />
      </van-button>
    </div>
    <uploader v-show="showImgSelect" ref="imgUploader" @change="handleMetafileChange" />
    <file-Uploader v-show="showFileSelect" ref="fileUploader" @change="handleMetafileChange" @clear="onClearFile" />
    <buzz-list-container
      scene="priv"
      :user="user"
      v-if="user.metaId"
      :lastBuzzTxId="lastBuzzTxId"
      :lastBuzzUseEncrypt="lastBuzzUseEncrypt"
    />
  </div>
</template>

<script>
import Uploader from "@/components/Uploader.vue";
import FileUploader from "@/components/FileUploader.vue";
import BuzzListContainer from "@/components/BuzzListContainer.vue";
import { getToken } from '@/api/buzz.ts'
import AppConfig from '@/config/'
import { mapState } from 'vuex'
import mime from 'mime-types'
import { Field } from 'vant'
import { useI18n } from 'vue-i18n-composable/src/index'

function setLocal(key, val) {
  return window.localStorage.setItem(key, val)
}
const sliceTag = '#文件分片测试'

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
      lastBuzzTxId: '',
      lastBuzzUseEncrypt: false,
      isSending: false
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
      const imgs = this.$refs.imgUploader.previewImages
      const fileSize = imgs.reduce((acc, cur) => acc + cur.output.size, 0)
      const savedSize = imgs.reduce((acc, cur) => acc + cur.input.size - cur.output.size, 0)
      // 基础体积费用 + 节省体积费用
      const basicSizeFee = Math.floor(fileSize * mineFeeRate * postImgFeeRate)
      const savedSizeFee = Math.floor(savedSize * mineFeeRate * compressFeeRate)
      console.log('fee', { postFee, basicSizeFee, savedSizeFee})
      return { postFee, basicSizeFee, savedSizeFee }
    },
    computeFileFees() {
      const postFee = 1000
      const mineFeeRate = 0.5
      const postFeeRate = 0.05
      const files = this.showFileSelect
        ? this.$refs.fileUploader.files
        : this.$refs.imgUploader.previewImages.map(i => i.output)
      const fileSize = files.reduce((acc, cur) => acc + cur.size, 0)
      const fileSizeFee = Math.floor(fileSize * mineFeeRate * postFeeRate)
      console.log('fee', { postFee, fileSizeFee })
      return { postFee, fileSizeFee }
    },
    updateAttachmentsEncrypt() {
      if (this.useEncrypt) {
        this.attachments.forEach(i => i.encrypt = 1)
      } else {
        this.attachments.forEach(i => delete i.encrypt)
      }
    },
    send() {
      let useSelfPath = false
      if (this.isSlice) {
        useSelfPath = true
      }
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
      // const feeMap = this.attachments[0]?.fileType.includes('image') ? this.computeAppFees() : this.computeFileFees()
      const feeMap = this.computeFileFees()
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
        payCurrency: "BSV", // 没有 payto 才生效，可选值 usd，展示美分
        payTo,
        path: useSelfPath ? '/Protocols/SimpleMicroblog/self' : '/Protocols/SimpleMicroblog',
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
        // needConfirm: this.$isInShowApp && this.needConfirm,
        // checkOnly: true, // dev
        callback: (res) => {
          // 确认付款完后的回调
          this.$toast.clear()
          this.isSending = false
          if (res.code === 200) {
            // { message, rawTx, txId }
            console.log(res.data.txId, res);
            // reset
            this.lastBuzzTxId = res.data.txId
            this.lastBuzzUseEncrypt = this.useEncrypt
            this.content = ''
            this.attachments = []
            this.clearFiles()
            this.useEncrypt = false
            this.showImgSelect = false
            this.showFileSelect = false
            this.$toast.success('发送成功')
          } else {
            new Error(res.data.message);
            this.$toast(res.data.message)
            if (res.code === 400) {
              window.localStorage.clear()
            }
          }
        },
        onCancel: (res) => {
          this.isSending = false
          console.log('cancel: ', res)
        }
      }
      console.log(config)
      this.isSending = true
      if (this.$isInShowApp) {
        setTimeout(() => {
          this.isSending = false
        }, 3000)
      }
      window.__metaIdJs.addProtocolNode_(config);
    },
    handleMetafileChange({files}) {
      this.attachments = files.map(file => {
        let res = {
          fileName: file.name,
          fileType: file.type,
          data: file.hex
        }
        if (file.chunkIndex > -1) {
          res.chunkIndex = file.chunkIndex
        }
        return res
      })
      if (this.showFileSelect && this.attachments.length) {
        let { fileName } = this.attachments[0]
        if (files[0].chunkIndex > -1) {
          this.content = `${sliceTag}:${fileName}`
        } else {
          this.content += `#分享文件 ${fileName}`
        }
        // console.log(txId)
      }
    },
    onClearFile() {
      this.content = ''
    },
    clearFiles() {
      this.$refs.imgUploader.clear()
      this.$refs.fileUploader.clear()
    },
    handleCmdEnter(e) {
      if (e && (e.metaKey || e.ctrlKey) && e.keyCode == 13) {
        this.send()
      }
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      accessToken: 'accessToken',
      isSDKLoaded: 'isSDKLoaded',
      needConfirm: 'needConfirm'
    }),
    isSlice() {
      return this.attachments[0]?.chunkIndex > -1
    }
  },
  created() {
  },
  watch: {
    'showFileSelect': function(val) {
      if (val === false) {
        // this.content = ''
      } else {
        this.showImgSelect = false
        this.useEncrypt = false
      }
      this.attachments = []
    },
    'showImgSelect': function(val) {
      if (val === false) {
        // this.content = ''
      } else {
        this.showFileSelect = false
        this.useEncrypt = false
      }
      this.attachments = []
    },
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
  .text-option {
    display: flex;
    align-items: center;
    .item {
      margin-right: 6px;
    }
    label {
      margin-left: 4px;
    }
  }
}
</style>
<style>
.van-field__control {
  color: #0f1419;
  font-size: 16px;
}
</style>