<template>
  <div class="pub-list">
    <button @click="$router.go(-1) ">返回</button>
    <buzz-detail :buzz="buzz" v-if="buzz.protocol" />
  </div>
</template>

<script>
import BuzzDetail from "@/components/BuzzDetail";
import { getBuzz } from '@/api/metasv-buzz.ts'

export default ({
  name: "Detail",
  components: {
    BuzzDetail
  },
  data() {
    return {
      // txId: '',
      buzz: {}
    };
  },
  methods: {
    getFull(txId) {
      getBuzz({txId}).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.dataDone = true
          const items = res.data.results?.items || []
          this.buzz = items[0] || {}
        }
      })
    }
  },
  computed: {
  },
  created() {
    const txId = this.$route.params.txId
    let buzzCache = localStorage.getItem('buzz') || '{}'
    buzzCache = JSON.parse(buzzCache)
    if (buzzCache.txId === txId) {
      this.buzz = buzzCache
      if (this.buzz.content.endsWith('...')) {
        this.getFull(txId)
      }
    } else {
      this.getFull(txId)
    }
  }
});
</script>

<style scoped lang="stylus">
.pub-list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
