<template>
  <div class="buzz-detail">
    <template v-if="buzz.protocol">
      <quote-item
        v-if="buzz.protocol.toLowerCase() === 'simplerepost'"
        :buzz="buzz"
      />
      <buzz-item :buzz="buzz" v-else />
    </template>
    <div class="title">评论：</div>
    <van-loading v-show="curBuzzListData.loading" color="#1989fa" class="loading" />
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
    getInteractiveBuzzList() {
      const params = {
        Protocols: ['PayComment'],
        buzzTxId: this.buzz.txId,
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
          const items = res.data.results?.items || []
          this.buzzListData[this.curListType].data.push(...items)
        }
      })
    },
  },
  computed: {
    curBuzzListData() {
      return this.buzzListData[this.curListType].data
    }
  },
  created() {
    this.getInteractiveBuzzList()
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
