<template>
  <div class="send-page">
    <div class="head">
      <div class="username" @click="$router.push(`user/${user.metaId}`)">{{user.name || '...'}}</div>
      <sensilet-widget
        @disconnected="onDisconnected"
        @connected="onConnected"
      />
      <!-- <a class="address" :href="`https://whatsonchain.com/address/${user.address}`" target="_blank">{{user.address}}</a> -->
    </div>
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
      <!-- TODO 费用估算 -->
    </div>
    <div class="input-operation">
      <van-button color="var(--theme-color)" @click="send" size="small"
        :disabled='!isSDKLoaded || content === "" || isSending' class="send"
        :loading="!isSDKLoaded || isSending"
      >
        <van-icon name="guide-o" size="25" />
      </van-button>
    </div>
    <div class="desc">使用 Sensilet 发 buzz，需要已经创建过 metaid 的钱包。
      <br>
      需搭配
      <a href="https://github.com/cyio/sensilet/releases/" target="_blank">Releases · cyio/sensilet</a>
      使用
    </div>
    <div class="result" v-show="lastBuzzTxId">
      发送成功：<a :href="`https://whatsonchain.com/tx/${lastBuzzTxId}`" target="_blank">TX</a>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import metaIdUtils from '@/utils/meta-id'
import newNodePathUtils from '@/utils/node-path'
import { getNewNodePath, getMetaIdByZoreAddress, getOwnShowAccount, getProtocolDataList } from '@/api/buzz.ts'
import { useI18n } from 'vue-i18n-composable/src/index'
import { Field } from 'vant'
import SensiletWidget from '@/components/SensiletWidget.vue';

export default ({
  name: "Send",
  props: {
  },
  components: {
    [Field.name]: Field,
    SensiletWidget
  },
  data() {
    return {
      isSDKLoaded: true,
      content: '',
      isSending: false,
      useEncrypt: false,
      useExtractCode: false,
      showImgSelect: false,
      showFileSelect: false,
      lastBuzzTxId: '',
      lastBuzz: {},
      lastBuzzUseEncrypt: false,
      user: {},
      selectedFT: 'BSV'
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  ...mapState({
    // user: 'user'
  }),
  methods: {
    async send() {
      const buzzData = {
        createTime: new Date().getTime(),
        content: this.content,
        contentType: 'text/plain',
        // attachments: 
        // mention: [],
      }
      // const attachments = this.attachments.map((item, index) => {
      //   let ext = mime.extension(item.fileType)
      //   if (ext === false) {
      //     let tmp = item.fileName.split('.')
      //     ext = tmp[tmp.length - 1]
      //   }
      //   const extStr = /webp|jpg|png|jpeg|gif/.test(ext) ? '' : `.${ext}`
      //   return `![metafile](${index})${extStr}`
      // })
      // if (attachments.length) {
      //   buzzData.attachments = attachments
      // }
      if (this.encryptContent) {
        const psd = this.encryptPSD
        buzzData.encrypted = AES.encrypt(this.encryptContent, psd).toString()
        // buzzData.contentType += ':AES'
        // buzzData.encryptAlgo = 'AES'
      }
      // const feeMap = this.attachments[0]?.fileType.includes('image') ? this.computeAppFees() : this.computeFileFees()
      const feeMap = this.computeFileFees()
      const payTo = Object.keys(feeMap).map(key => ({
        amount: feeMap[key],
        address: this.$chargeAddress[key]
      }))
      console.log({payTo})
      // this.updateAttachmentsEncrypt()
      this.isSending = true
      // 如果用户使用 sensilet，且钱包属于当前用户，发帖走 sensilet。好处是不需要等 metaidjs 加载，弊端是展示不即时，需要等 1 次确认。
      const isMock = 0
      if (isMock) {
        this.onSendSuccess('1234')
      } else {
        let feeTx = null
        if (this.$isDev) {
          feeTx = 123
        } else {
          feeTx = await this.sendFees(payTo.filter(i => i.amount !== 0))
        }
        if (feeTx) {
          this.sendBySensilet(buzzData)
        } else {
          this.$toast('发送取消')
          this.isSending = false
        }
      }
    },
    async sendBySensilet(buzzData) {
      const pathInfo = await newNodePathUtils.get()
      console.log('use path: ', pathInfo.index)
      const buzz = metaIdUtils.buildBuzz({
        parentTxId: newNodePathUtils.parentTxId,
        newNodePublicKey: pathInfo.publicKey,
        buzzData,
        encrypt: String(+this.useEncrypt)
      })
      console.log(buzz)
      const { txId } = await sensilet.sendBuzz({
        metadata: buzz,
      })
      this.lastBuzz = buzzData
      this.lastBuzz.txId = txId
      this.lastBuzz.userName = this.user.name
      this.lastBuzz.timestamp = buzzData.createTime
      this.onSendSuccess(txId)
    },
    async sendFees(payTo) {
      const params = {
          receivers: payTo
          // broadcast: false, //default is true, sensilet will broadcast this tx. also you can send false to get a signed rawHex and broadcast yourself
      };
      try {
        let txid = null
        if (this.selectedFT === 'BSV') {
          txid = await sensilet.transferBsv(params);
        } else {
          txid = await sensilet.transferSensibleFt(params);
        }
        console.log(txid)
        this.$toast('支付成功');
        return txid
      } catch(e) {
        this.$toast('支付取消');
        return
      }
    },
    onSendSuccess(txId) {
      this.isSending = false
      this.lastBuzzTxId = txId
      this.lastBuzzUseEncrypt = this.useEncrypt
      this.content = ''
      this.encryptContent = ''
      this.attachments = []
      // this.clearFiles()
      this.useEncrypt = false
      this.useExtractCode = false
      this.showImgSelect = false
      this.showFileSelect = false
      this.$toast.success('发送成功')
      console.info('发送成功tx: ', txId)
    },
    handleCmdEnter(e) {
      if (e && (e.metaKey || e.ctrlKey) && e.keyCode == 13) {
        this.send()
      }
    },
    computeFileFees() {
      const postFee = 1000
      const postExtractCodeFee = this.useExtractCode ? 9000 : 0
      const mineFeeRate = 0.5
      const postFeeRate = 0.05
      // const files = this.showFileSelect
      //   ? this.$refs.fileUploader.files
      //   : this.$refs.imgUploader.previewImages.map(i => i.output)
      const files = []
      const fileSize = files.reduce((acc, cur) => acc + cur.size, 0)
      const fileSizeFee = Math.floor(fileSize * mineFeeRate * postFeeRate)
      console.log('fee', { postFee, fileSizeFee })
      return { postFee, fileSizeFee, postExtractCodeFee }
    },
    async init() {
      this.user.address = this.$sensiletStore.address
      const { rootTxId } = await getMetaIdByZoreAddress({
        zeroAddress: this.user.address
      })
      this.user.metaId = rootTxId
      this.getBuzzParentTxId()
      console.log({rootTxId})
    },
    async getBuzzParentTxId() {
      const res = await getOwnShowAccount({
        data: JSON.stringify({
          showId: this.user.metaId
        })
      })
      if (res.msg === 'success') {
        this.user = {
          ...this.user,
          ...res.result
        }
        const { xpub, protocolTxId } = res.result
        console.log('ShowAccount 1', xpub, protocolTxId)
        const resp = await getProtocolDataList({
          data: JSON.stringify({
            protocolTxId,
            nodeName: 'SimpleMicroblog'
          })
        })
        if (resp.msg === 'success') {
          const parentTxId = resp.result.data[0].txId
          newNodePathUtils.init({
            xpub,
            parentTxId
          })
          console.log('ShowAccount ready!')
        }
      }
    },
    onDisconnected() {
      this.user = {}
      this.lastBuzzTxId = null
    },
    onConnected() {
      this.init()
    }
  },
  computed: {
  },
  created() {
    this.init()
  }
});
</script>

<style scoped lang="scss">
.head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 25px;
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
}
.input-operation {
  // display: flex;
  justify-content: space-between;
  .send {
    width: 80px;
    float: right;
  }
}
.desc {
  color: #333;
  font-size: 14px;
}
.result {
  margin-top: 20px;
  font-size: 14px;
}
.username {
  font-weight: bold;
  cursor: pointer;
  color: #8b591b;
  &:hover {
    color: var(--theme-color);
  }
}
</style>
