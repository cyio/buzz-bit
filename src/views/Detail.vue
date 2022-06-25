<template>
  <div class="detail">
    <div class="head">
      <van-icon class="back" name="arrow-left" @click="$router.go(-1)" />
      <!-- <button >{{t('btn.back')}}</button> -->
    </div>
    <buzz-detail :buzz="buzz" v-if="!showLoading" />
    <van-loading v-else color="var(--theme-color)" class="loading" />
  </div>
</template>

<script>
import BuzzDetail from "@/components/BuzzDetail";
import { getBuzz } from '@/api/buzz.ts'
import { useI18n } from 'vue-i18n-composable/src/index'
import { mapState } from 'vuex'

export default ({
  name: "Detail",
  components: {
    BuzzDetail
  },
  data() {
    return {
      // txId: '',
      buzz: {},
      showLoading: false,
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    getFull(txId) {
      this.showLoading = true
      getBuzz({ txId, MetaId: this.user.metaId }).then(res => {
        this.showLoading = false
        const { code, data } = res
        if (code === 0) {
          const items = data.results?.items || []
          if (items.length) {
            this.buzz = items[0] || {}
          } else {
            this.$toast('数据未查询到，请稍后再试')
          }
        }
      })
    },
    isValid(buzz) {
      if (buzz.protocol?.toLowerCase() === 'simplerepost') {
        return !!buzz.quoteitem
      } else {
        return true;
      }
    }
  },
  computed: {
    ...mapState({
      user: 'user',
    }),
  },
  created() {
    const txId = this.$route.params.txId
    let buzzCache = localStorage.getItem('buzz') || '{}'
    buzzCache = JSON.parse(buzzCache)
    if (buzzCache.txId === txId && buzzCache.encrypt === '0' && this.isValid(buzzCache)) {
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
    .back {
      width: 60px;
      height: 40px;
      background: #eee;
      border-radius: 6px;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
    }
  }
}
</style>
