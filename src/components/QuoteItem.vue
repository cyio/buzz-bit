<template>
  <div class="quote-item">
      <span>
        {{buzz.userName}} 转发了
      </span>
      <div class="item-original" v-if="dataDone">
        <buzz-item
          v-if="buzzData.originalNode.encrypt === '0'"
          :buzz="buzzData.originalNode"
          :show-footer="buzzData.data.rePostComment === ''"
          :show-avatar="buzzData.data.rePostComment === ''" 
        />
        <div v-else class="content-reject">内容无权访问</div>
      </div>
  </div>
</template>

<script>
import { getBuzzRelationData, getBuzz } from '@/api/metasv-buzz'
import BuzzItem from './BuzzItem.vue'

export default ({
  name: "QuoteItem",
  props: {
    buzz: Object
  },
  components: {
    BuzzItem
  },
  data() {
    return {
      buzzData: {},
      dataDone: false
    };
  },
  methods: {
    getBuzzData() {
      
    }
  },
  computed: {
    url() {
      return `https://www.google.com/search?q=site%3Ashowbuzz.app%2Fdetails+${this.keywords}`
    }
  },
  async created() {
    this.buzzData = Object.assign(this.buzzData, this.buzz)
    // const userInfo = await this.$MetaIdDataAdapter.getUserInfo(this.buzz.rootTxId)
    // this.buzzData.userInfo = userInfo
    // 获取关联信息
    // const relationDataRes = await getBuzzRelationData(this.buzz.txId)
    // this.buzzData.isRelationLoaded = true
    // if (relationDataRes.code === 200 && relationDataRes.result.data.length) {
    //   const list = relationDataRes.result.data
    //   list.forEach(data => {
    //     if (data.parentNodeName.toLowerCase() === 'paylike') {
    //       this.buzzData.likes.push(data)
    //     } else if (data.parentNodeName.toLowerCase() === 'paycomment') {
    //       this.buzzData.comments.push(data)
    //     } else if (data.parentNodeName.toLowerCase() === 'simplerepost') {
    //       this.buzzData.reposts.push(data)
    //     }
    //   })
    // }
    const parentNodeName = this.buzz.protocol?.toLowerCase()
    if (['simplerepost', 'paycomment'].indexOf(parentNodeName) !== -1) {
      // console.log(parentNodeName)
      const txId = parentNodeName === 'simplerepost' ? this.buzz.quoteItem.txId : this.buzz.data.commentTo
      const params = {
        txId
      }
      getBuzz(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.dataDone = true
          const items = res.data.results?.items || []
          this.buzzData.originalNode = items[0] || {}
        }
      })
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.quote-item {
  margin: 15px 0;
  border: 1px solid #d0c9c9;
  padding: 10px 5px;
  overflow: hidden;
  .item-original {
    background: #f7f8fb;
    margin-left: 24px;
  }
}
</style>
