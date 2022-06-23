<template>
  <div class="decode-view">
    <div class="title">支持 Metafile 协议 1.0
      <a href="https://whatsonchain.com/tx/7fe74c9845fab0a08dd4fc2389c5b07038d05f3f019fa0b5c391e1a22559bf3d" target="_blank">测试tx</a>
    </div>
    <!-- 请导入交易原始文件（hex） -->
    <input type="text" name=""
        id="" placeholder="输入含有有效 txid 的地址，或仅 txid" v-model="txUrl">
    <button @click="checkInput">获取</button>
    <button @click="clear">清除</button>
    <div class="form">
      数据源：
      <select v-model="selected">
        <option disabled value="">请选择</option>
        <option>showMANDB</option>
        <option>whatsonchain</option>
      </select>
    </div>
    <div class="or">或</div>
    <input type="text" name=""
        id="" placeholder="输入hex" v-model="txHexInput">
    <button @click="checkHexInput">获取</button>
    <button @click="clearHex">清除</button>
    <!-- <input type="file" name="inputfile"
            id="inputfile" @change="change"> -->
    <div class="preview">
      解析结果：
      <div class="size"></div>
      <file-decode
        v-if="txId || txHex"
        :txId="txId"
        :txHex="txHex"
        :apiService="selected"
        :showMetaInfo="true"
        :key="txId"
       />
    </div>
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
      txId: '',
      txHex: '',
      txHexInput: '',
      selected: 'showMANDB'
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
    },
    checkHexInput() {
      this.txHex = this.txHexInput
    },
    clearHex() {
      this.txHex = ''
      this.txHexInput = ''
    },
    clear() {
      this.txUrl = ''
      this.txId = ''
    }
  },
  computed: {
  },
  watch: {
    'selected': function() {
      this.txId = ''
    }
  }
});
</script>

<style scoped lang="scss">
.decode-view {
  max-width: 600px;
  margin: 0 auto;
  input {
    width: 70%;
  }
  .form {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  button  {
    margin-left: 10px;
  }
  .or {
      margin: 15px 0 10px;
  }
  .preview {
    margin-top: 20px;
  }
}
</style>
