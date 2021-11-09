<template>
  <div class="file-decode">
    <van-loading v-show="loading" color="#1989fa" class="loading" />
    <file-preview v-if="!loading" :url="blobUrl" :type="blob.type" />
  </div>
</template>

<script>
import { Script } from 'bsv'
import FilePreview from '@/components/FilePreview'

function hexToUtf8(s){
  return decodeURIComponent(
     s.replace(/\s+/g, '') // remove spaces
      .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
  );
}

export default ({
  name: "FileDecode",
  props: {
    txId: String
  },
  components: {
    FilePreview
  },
  data() {
    return {
      blob: {},
      blobUrl: '',
      loading: true
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
      let file = arr[7]
      let fileTypeStr = hexToUtf8(arr[arr.length - 2])
      let binaryStr = hexToUtf8(arr[arr.length - 1])
      let isBinary = binaryStr === 'binary'
      if (!isBinary) {
        alert('不是文件')
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
    checkInput() {
      let arr = this.txUrl.split('/')
      let txId = arr[arr.length - 1]
      if (!txId) {
        alert('交易ID 无效')
        return 
      }
      let url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txId}/out/0/hex`
      this.queryHex(url)
    },
    async queryHex(url) {
      let res = await fetch(url)
      let hex = await res.text()
      setTimeout(() => {
        this.loading = false
      }, 10)
      this.decodeHex(hex)
    }
  },
  computed: {
  },
  created() {
    let url = `https://api.whatsonchain.com/v1/bsv/main/tx/${this.txId}/out/0/hex`
    this.queryHex(url)
  }
});
</script>

<style scoped lang="stylus">
.file-decode {
  height: 100%;
}
</style>
