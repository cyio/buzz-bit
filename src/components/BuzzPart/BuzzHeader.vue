<template>
  <div class="item-head">
    <div class="left">
      <div class="avatar"></div>
      <div class="userinfo">
        <!-- <img :src="hexToBase64Img(userInfo.headUrl)" :size="40" /> -->
        <div class="username" @click.stop="goUserDetail" v-show="username">{{ username }}</div>
        <div class="time">{{ buzz.timestamp | formatTime(buzz) }}</div>
      </div>
    </div>
    <div class="right" v-show="buzz.txId">
      <a class="tx-link" :href="getTxUrl(buzz.txId)" target="_blank" @click.stop="">tx</a>
      <a class="tx-link" :href="getShowBuzzUrl(buzz.txId)" target="_blank" @click.stop="">showbuzz</a>
    </div>
  </div>
</template>

<script>
import { formatTime, shared } from '@/utils/index';
import { format as timeagoFormat } from 'timeago.js';

export default ({
  name: "BuzzHeader",
  props: {
    buzz: Object,
    required: true
  },
  components: {
  },
  data() {
    return {
    };
  },
  methods: {
    getTxUrl(txId) {
      return 'https://whatsonchain.com/tx/' + txId
    },
    getShowBuzzUrl(txId) {
      return 'https://www.showbuzz.app/details/' + txId
    },
    goUserDetail() {
      const id = this.buzz.metaId
      this.$router.push({ path: `/user/${id}` })
    }
  },
  computed: {
    username() {
      return this.buzz.userName || this.buzz.name
    }
  },
  filters: {
    formatTime(time, buzz) {
      if (buzz.__embed) {
        return formatTime(time, true)
      }
      const useTimeago = (new Date()) - time < 86400000
      return useTimeago ? timeagoFormat(time, shared.isZh ? 'zh_CN' : 'en_US') : formatTime(time)
    }
  }
});
</script>

<style scoped lang="scss">
.item-head {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  .userinfo {
    display: flex;
    align-items: center;
    .username {
      font-weight: bold;
      margin-right: 6px;
    }
    .time {
      color: #909399;
      font-size: 12px;
    }
  }
  .tx-link {
    padding: 0 5px;
    color: #909399;
    font-size: 12px;
  }
}
</style>