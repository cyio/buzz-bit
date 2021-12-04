<template>
  <div class="decode-view">
    <div class="title">支持 Metafile 协议 1.0</div>
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
    <!-- <input type="file" name="inputfile"
            id="inputfile" @change="change"> -->
    <div class="preview">
      解析结果：
      <div class="size"></div>
      <file-decode
        v-if="txId"
        :txId="txId"
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
    margin-bottom: 10px;
  }
  button  {
    margin-left: 10px;
  }
  .form {
    margin-top: 10px;
  }
}
</style>
