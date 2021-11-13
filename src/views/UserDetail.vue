<template>
  <div class="user-detail">
    <van-loading v-show="loading" color="#1989fa" class="loading" />
    <template v-if="!loading && curBuzzListData.length">
      <div class="head">
        <div class="username">{{curBuzzListData[0].userName}}</div>
      </div>
      <div class="wallet" v-if="check()">
        <div class="row">
          <button class="tip" @click="connect">连接感应钱包</button>
          <button class="tip" @click="disconnect">断开</button>
          <div class="address">当前钱包：{{address ? address.slice(0, 6) : ''}}...</div>
        </div>
        <input type="number" placeholder="金额" v-model="amount" min="200"> 聪
        <button class="tip" @click="tip">打赏 Buzz 主</button>
      </div>
      <BuzzList :buzzListData="curBuzzListData" />
    </template>
  </div>
</template>

<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList } from '@/api/metasv-buzz.ts'

export default ({
  name: "UserDetail",
  components: {
    BuzzList
  },
  data() {
    return {
      loading: false,
      curListType: 'user',
      buzzListData: {
        user: []
      },
      currentPage: 1,
      address: null,
      amount: 200
    };
  },
  methods: {
    getBuzzList() {
      const metaId = this.$route.params.id
      const params = {
        Protocols: ['SimpleMicroblog'],
        metaId,
        page: "" + this.currentPage,
        pageSize: '6',
        timestamp: 0
      }
      this.loading = true
      getBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData.user = items.filter(i => i.encrypt === '0')
        }
      })
    },
    check() {
      if (typeof window.sensilet === 'undefined') {
        return false
      }
      return true
    },
    async connect() {
      const address = await sensilet.requestAccount();
      this.address = address
      this.$toast('连接成功');
      console.log(address)
    },
    disconnect() {
      sensilet.exitAccount()
      this.address = '...'
    },
    async tip() {
      // const bsvBalance = await sensilet.getBsvBalance();
      const params = {
          receivers: [{
              address: this.curBuzzListData[0].zeroAddress,
              amount: this.amount   //unit: Sat.
          }],
          // broadcast: false, //default is true, sensilet will broadcast this tx. also you can send false to get a signed rawHex and broadcast yourself
      };
      try {
        const txid = await sensilet.transferBsv(params);
        console.log(txid)
        this.$toast('支付成功');
      } catch(e) {
        this.$toast('支付取消');
      }
    },
    async init() {
      const isConnected = await sensilet.isConnect();
      if (isConnected) {
        const accountInfo = await sensilet.getAccount();
        this.address = accountInfo
      }
    }
  },
  computed: {
    curBuzzListData() {
      let list = this.buzzListData[this.curListType]
      if (!this.showVideoInFlow) {
        return list.filter(i => {
          const hasVideo = i.attachments && i.attachments[0] && i.attachments[0].endsWith('.mp4')
          return !hasVideo
        })
      }
      return list
    }
  },
  created() {
    this.getBuzzList()
    if (this.check()) {
      this.init()
    } else {
      this.$toast('Sensilet 未安装');
    }
  },
});
</script>

<style lang="scss" scoped>
.user-detail {
  .head {
    // display: flex;
    .username {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .tip {
      margin-left: 16px;
      width: 120px;
    }
  }
  .wallet {
    margin-bottom: 16px;
    button {
      margin-right: 6px;
    }
    .row {
      display: flex;
      margin-bottom: 8px;
    }
  }
}
</style>
