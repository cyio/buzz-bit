<template>
  <div class="buzz-detail">
    <buzz-item :buzz="buzz" v-if="buzz.protocol" />
    <div class="title">评论：</div>
    <van-loading v-show="loading" color="#1989fa" class="loading" />
    <div v-show="!loading">
      <buzz-list v-if="buzzListData.length" :buzzListData="buzzListData" class="comment-wrap" />
      <div v-else class="no-comment">暂无评论</div>
    </div>
  </div>
</template>

<script>
import BuzzItem from "@/components/BuzzItem";
import FileDecode from '@/components/FileDecode'
import BuzzList from "@/components/BuzzList.vue";
import { getInteractiveBuzzList } from '@/api/metasv-buzz.ts'

export default ({
  name: "BuzzDetail",
  props: {
    buzz: Object
  },
  components: {
    FileDecode,
    BuzzItem,
    BuzzList
  },
  data() {
    return {
      loading: false,
      buzzListData: []
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
      this.loading = true
      getInteractiveBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData.push(...items)
        }
      })
    },
  },
  computed: {
    curBuzzListData() {
      return this.buzzListData.comment
    }
  },
  created() {
    this.getInteractiveBuzzList()
  }
});
</script>

<style scoped lang="stylus">
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
