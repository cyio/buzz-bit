<template>
  <div class="pub-list">
    <div class="title">支持 Metafile 协议 1.0</div>
    <!-- 请导入交易原始文件（hex） -->
    <input type="text" name=""
        id="" placeholder="输入 metafile:// 地址" v-model="txUrl">
    <button @click="checkInput">获取（从区块链）</button>
    <!-- <input type="file" name="inputfile"
            id="inputfile" @change="change"> -->
    <!-- <div class="size">文件大小：{{blob.size}}</div> -->
    <!-- <div class="size">文件类型：{{blob.type}}</div> -->
    <file-decode v-if="txId" :txId="txId" />
  </div>
</template>

<script>
import FileDecode from '@/components/FileDecode'

export default ({
  name: "Decode",
  components: {
    FileDecode
  },
  data() {
    return {
      txUrl: '',
      txId: ''
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
    checkInput() {
      let arr = this.txUrl.split('/')
      let txId = arr[arr.length - 1]
      if (!txId) {
        alert('交易ID 无效')
        return 
      }
      this.txId = txId
      // let url = `https://api.whatsonchain.com/v1/bsv/main/tx/${txId}/out/0/hex`
      // this.queryHex(url)
    }
  },
  computed: {
  }
});
</script>

<style scoped lang="stylus">
.pub-list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
