<template>
  <div class="file-decode">
    <van-loading v-show="loading" color="#1989fa" class="loading" />
    <div v-if="!loading">
      <buzz-item v-if="buzz" :buzz="buzz" />
      <template v-else>
        <div class="size" v-show="showMetaInfo">文件大小：{{blob.size}} 文件类型：{{blob.type}}</div>
        <!-- <div v-if="buzz" class="content" v-html="displayContent(buzz.content)"></div> -->
        <file-preview
          :url="blobUrl" :type="blob.type"
          v-if="showPreview"
        />
        <div class="media-placeholder" v-else>
          媒体资源，点击进详情查看
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { Script } from 'bsv'
import FilePreview from '@/components/FilePreview'
import BuzzItem from "@/components/BuzzItem";
import {queryHex} from '@/api/'

function hexToUtf8(s){
  return decodeURIComponent(
     s.replace(/\s+/g, '') // remove spaces
      .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
  );
}

export default ({
  name: "FileDecode",
  props: {
    txId: String,
    apiService: {
      type: String,
      default: 'showMANDB',
      // default: 'whatsonchain',
    },
    showMetaInfo: false,
    mode: {
      type: String,
      default: 'post'
    }
  },
  components: {
    FilePreview,
    BuzzItem
  },
  data() {
    return {
      blob: {
        type: ''
      },
      blobUrl: '',
      loading: false,
      buzz: null
    };
  },
  methods: {
    change: function (e) {
      const fr = new FileReader();
      fr.onload = () => {
        this.decodeHex(fr.result)
      }
        
      fr.readAsText(e.target.files[0], );
    },
    decodeHex(hex) {
      let script = new Script().fromHex(hex)
      let asm = script.toAsmString()
      let arr = asm.split(' ')
      if(1) {
        console.log(arr)
        let res = arr.filter(i => i.length <= 1000)
          .map(i => hexToUtf8(i))
        if (res[6].includes('SimpleMicroblog')) {
          this.buzz = JSON.parse(res[7])
          this.buzz.timestamp = this.buzz.createTime
        }
        console.log(res)
      }
      let file = arr[7]
      let fileTypeStr = hexToUtf8(arr[arr.length - 2])
      let binaryStr = hexToUtf8(arr[arr.length - 1])
      let isBinary = binaryStr === 'binary'
      if (!isBinary) {
        this.$toast('不是文件')
        return
      }
      // console.log(arr)
      this.blobUrl = this.hexToBlobUrl(file, fileTypeStr)
    },
    hexToBlobUrl(hexStr, type = '') {
        // console.log('hex', hexStr)
        let buf = Buffer.from(hexStr, 'hex')
        // console.log('buf', buf)
        this.blob = new Blob([buf], {type})
        // console.log('blob', blb)
        let url = URL.createObjectURL(this.blob)
        // console.log('url', url)
        return url
    },
    parseTxInput(str) {
      let txId = str
      if (str.includes('/')) {
        let arr = this.txUrl.split('/')
        txId = arr[arr.length - 1]
      }
      return txId
    },
    checkInput() {
      let txId = this.parseTxInput(this.txUrl)
      if (!txId) {
        alert('交易ID 无效')
        return 
      }
      this.queryHex(txId)
    },
    async queryHex(txId) {
      this.loading = true
      if (txId.includes('.')) {
        txId = txId.split('.')[0]
      }
      let hex = await queryHex[this.apiService](txId)
      // show 文件服务不即时 error: "Has no this node"，降级转用其他服务
      if (this.apiService === 'showMANDB' && hex.length < 80) {
        hex = await queryHex['whatsonchain'](txId)
        if (hex.length < 80) {
          hex = await queryHex['whatsonchain'](txId, 1)
        }
      }
      setTimeout(() => {
        this.loading = false
      }, 10)
      if (hex.length <= 30) {
        console.log('文件未取到')
        return
      }
      this.decodeHex(hex)
    }
  },
  computed: {
    showPreview() {
      if (this.mode === 'list') {
        const { type } = this.blob
        return type.includes('image')
      }
      return true
    }
  },
  created() {
    if (this.mode !== 'list') {
      this.queryHex(this.txId)
    }
  }
});
</script>

<style scoped lang="scss">
.file-decode {
  height: 100%;
  .media-placeholder {
    font-size: 14px;
    color: gray;
  }
}
</style>
