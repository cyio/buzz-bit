<template>
  <div class="quote-item" :class="['mode-' + mode]">
    <div class="quote-wrap">
      <div class="item-left">
        <buzz-side :avatarTxId="buzz.avatarTxId" :userTxId="buzz.metaId" />
      </div>
      <div class="item-main" @click="goDetail">
        <buzz-header :buzz="buzz" />
        <div class="content" v-html="displayContent(buzz.content)"></div>
      </div>
    </div>
    <div class="item-original" v-if="buzzData.quoteItem">
      <buzz-item
        v-if="buzzData.quoteItem.encrypt === '0'"
        :buzz="buzzData.quoteItem"
        :show-footer="buzzData.data.rePostComment === ''"
        :show-avatar="buzzData.data.rePostComment === ''"
        :mode="mode"
        :is-original="true"
      />
      <div v-else class="content-reject">内容无权访问</div>
    </div>
    <buzz-footer :buzz="buzz" v-if="showFooter && buzz.txId" class="footer" />
  </div>
</template>

<script>
import { getBuzz } from '@/api/buzz'
import BuzzItem from './BuzzItem.vue'
import BuzzHeader from './BuzzPart/BuzzHeader.vue'
import BuzzSide from './BuzzPart/BuzzAvatar.vue'
import BuzzFooter from './BuzzPart/BuzzFooter.vue'
import mixin from './BuzzPart/mixin'
import { mapState } from 'vuex'

export default ({
  name: "QuoteItem",
  mixins: [mixin],
  props: {
    buzz: Object,
    mode: {
      type: String,
      default: 'detail'
    },
    showFooter: {
      type: Boolean,
      default: true
    },
  },
  components: {
    BuzzItem,
    BuzzHeader,
    BuzzSide,
    BuzzFooter
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
    avatarUrl() {
      return `https://showman.showpay.io/metafile/avatar/${this.buzz.avatarTxId}?timestamp=${+new Date()}`
    },
    ...mapState({
      user: 'user',
    }),
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
      // if (parentNodeName === 'simplerepost') {
      //   this.buzzData.quoteItem = this.buzz.quoteItem || {}
      //   return
      // }
      const txId = parentNodeName === 'simplerepost' ? this.buzz.quoteItem?.txId || this.buzz.rePost[0]?.txId : this.buzz.data.commentTo
      if (!txId) {
        console.log(this.buzz.quoteItem, this.buzz.rePost)
        return
      }
      const params = {
        txId,
        MetaId: this.user.metaId
      }
      getBuzz(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.dataDone = true
          const items = data.results?.items || []
          this.$set(this.buzzData, 'quoteItem', items[0] || {})
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
  .quote-wrap {
    display: flex;
  }
  .item-inner {
    margin-bottom: 10px;
  }
  .item-original {
    margin-left: 50px;
    margin-top: 12px;
    border-radius: 20px;
    border: 1px solid #cfd9de;
  }
  .footer {
    margin-top: 10px;
    padding-left: 50px;
  }
  .item-main {
    margin-left: 12px;
    width: 100%;
    overflow: hidden;
  }
  .item-left {
    width: 40px;
  }
}
</style>
