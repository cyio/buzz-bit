<template>
  <div class="detail">
    <div class="head">
      <button @click="$router.go(-1) ">{{t('btn.back')}}</button>
    </div>
    <buzz-detail :buzz="buzz" v-if="buzz.protocol" />
    <van-loading v-else color="#1989fa" class="loading" />
  </div>
</template>

<script>
import BuzzDetail from "@/components/BuzzDetail";
import { getBuzz } from '@/api/buzz.ts'
import { useI18n } from 'vue-i18n-composable/src/index'

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
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    getFull(txId) {
      getBuzz({txId}).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.dataDone = true
          const items = data.results?.items || []
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
    if (buzzCache.txId === txId && buzzCache.encrypt === '0') {
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

<style scoped lang="scss">
.detail {
  .head {
    margin-bottom: 15px;
  }
}
</style>
