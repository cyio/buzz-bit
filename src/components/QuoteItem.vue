<template>
  <div class="quote-item" :class="['mode-' + mode]">
    <div class="item-inner" @click="goDetail">
      <buzz-header :buzz="buzz" />
      <div class="content" v-html="displayContent(buzz.content)"></div>
    </div>
    <div class="item-original" v-if="buzzData.quoteItem">
      <buzz-item
        v-if="buzzData.quoteItem.encrypt === '0'"
        :buzz="buzzData.quoteItem"
        :show-footer="buzzData.data.rePostComment === ''"
        :show-avatar="buzzData.data.rePostComment === ''"
        :mode="mode"
      />
      <div v-else class="content-reject">内容无权访问</div>
    </div>
  </div>
</template>

<script>
import { getBuzzRelationData, getBuzz } from '@/api/buzz'
import BuzzItem from './BuzzItem.vue'
import BuzzHeader from './BuzzPart/BuzzHeader.vue'
import mixin from './BuzzPart/mixin'

export default ({
  name: "QuoteItem",
  mixins: [mixin],
  props: {
    buzz: Object,
    mode: String
  },
  components: {
    BuzzItem,
    BuzzHeader
  },
  data() {
    return {
      buzzData: {},
      dataDone: false
    };
  },
  methods: {
    goDetail() {
      if (this.mode === 'list') {
        this.$router.push({ path: `/detail/${this.buzz.txId}` })
        localStorage.setItem('buzz', JSON.stringify(this.buzz))
      }
    }
  },
  computed: {
  },
  created() {
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
      if (parentNodeName === 'simplerepost') {
        this.buzzData.quoteItem = this.buzz.quoteItem || {}
        return
      }
      const txId = parentNodeName === 'simplerepost' ? this.buzz.quoteItem.txId : this.buzz.data.commentTo
      const params = {
        txId
      }
      getBuzz(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.dataDone = true
          const items = res.data.results?.items || []
          this.buzzData.quoteItem = items[0] || {}
        }
      })
    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.quote-item {
  border-top: 1px solid #eae7e7;
  padding: 10px 5px;
  overflow: hidden;
  &.mode-list:hover {
    cursor: pointer;
    background-color: #f7f7f7;
  }
  .item-inner {
    margin-bottom: 10px;
  }
  .item-original {
    background: #f7f8fb;
    margin-left: 24px;
  }
}
</style>
