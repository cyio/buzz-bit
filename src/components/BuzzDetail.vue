<template>
  <div class="buzz-detail">
    <template v-if="buzz.protocol">
      <quote-item
        v-if="buzz.protocol.toLowerCase() === 'simplerepost'"
        :buzz="buzz"
      />
      <buzz-item
        v-else
        :buzz="buzz"
        @sent="onSent"
      />
    </template>
    <div class="title">评论：</div>
    <van-loading v-show="curBuzzListData.loading" color="var(--theme-color)" class="loading" />
    <div v-show="!loading">
      <buzz-list v-if="curBuzzListData.length" :buzzListData="curBuzzListData" class="comment-wrap" />
      <div v-else class="no-comment">暂无评论</div>
    </div>
  </div>
</template>

<script>
import BuzzItem from "@/components/BuzzItem";
import FileDecode from '@/components/FileDecode'
import BuzzList from "@/components/BuzzList.vue";
import { getInteractiveBuzzList } from '@/api/buzz.ts'
import QuoteItem from "./QuoteItem";

export default ({
  name: "BuzzDetail",
  props: {
    buzz: Object
  },
  components: {
    FileDecode,
    BuzzItem,
    QuoteItem,
    BuzzList
  },
  data() {
    return {
      loading: false,
      curListType: 'comment',
      buzzListData: {
        comment: {
          data: [],
          loading: false
        }
      }
    };
  },
  methods: {
    getInteractiveBuzzList(txId) {
      const params = {
        Protocols: ['PayComment'],
        buzzTxId: txId,
        // metaId: this.user.metaId,
        page: '1',
        pageSize: '10',
        timestamp: 0
      }
      this.buzzListData[this.curListType].loading = true
      getInteractiveBuzzList(params).then(res => {
        this.buzzListData[this.curListType].loading = false
        const { code, data } = res
        if (code === 0) {
          const items = data.results?.items || []
          this.$set(this.buzzListData[this.curListType], 'data', items)
          // 是否存在回复
          this.getReply(items)
        }
      })
    },
    getReply(items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (item.hasComment) {
          const params = {
            Protocols: ['PayComment'],
            buzzTxId: item.txId,
            page: '1',
            pageSize: '10',
            timestamp: 0
          }
          getInteractiveBuzzList(params).then(res => {
            const { code, data } = res
            if (code === 0) {
              this.$set(this.buzzListData[this.curListType].data[i], 'replyList_', data.results?.items || [])
            }
          })
        }
      }
    },
    onSent() {
      setTimeout(() => {
        this.getInteractiveBuzzList(this.buzz.txId)
      }, 300)
    }
  },
  computed: {
    curBuzzListData() {
      return this.buzzListData[this.curListType].data
    }
  },
  created() {
    this.getInteractiveBuzzList(this.buzz.txId)
  }
});
</script>

<style scoped lang="scss">
.buzz-detail {
  .comment-wrap {
    margin-left: 24px;
  }
  .no-comment {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 150px;
    color: gray;
  }
}
</style>
