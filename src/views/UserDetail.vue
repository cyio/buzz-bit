<template>
  <div class="user-detail">
    <van-loading v-show="loading" color="var(--theme-color)" class="loading" />
    <template v-if="!loading && curBuzzListData.length">
      <div class="head">
        <buzz-side :avatarTxId="curBuzzListData[0].avatarTxId" :userTxId="curBuzzListData[0].metaId" size="large" />
        <div class="username">{{curBuzzListData[0].userName}}</div>
      </div>
      <van-loading v-show="buzzListData[curListType].loading" color="var(--theme-color)" class="loading" />
      <BuzzList :buzzListData="curBuzzListData" v-show="!buzzListData[curListType].loading" />
      <van-pagination
        v-show="curBuzzListData.length > 0 && !buzzListData[curListType].loading"
        v-model="buzzListData[curListType].currentPage" :total-items="10000" :items-per-page="10"
        force-ellipses
      />
    </template>
  </div>
</template>

<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList } from '@/api/buzz.ts'
import { List, Pagination } from 'vant';
import BuzzSide from '@/components/BuzzPart/BuzzAvatar.vue'
const sensilet = window.sensilet

export default ({
  name: "UserDetail",
  components: {
    BuzzList,
    BuzzSide,
    [List.name]: List,
    [Pagination.name]: Pagination,
  },
  data() {
    return {
      loading: false,
      curListType: 'user',
      buzzListData: {
        user: {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        }
      },
      currentPage: 1,
      address: null,
      amount: 200,
      // factors: ['1', '0.00000001'],
      // selectFactor: '1'
    };
  },
  methods: {
    getUserBuzzList() {
      const metaId = this.$route.params.id
      const params = {
        Protocols: ['SimpleMicroblog', 'WebotBuzz'],
        metaId,
        page: "" + this.buzzListData[this.curListType].currentPage,
        pageSize: '6',
        timestamp: 0
      }
      this.buzzListData[this.curListType].loading = true
      return getBuzzList(params).then(res => {
        this.buzzListData[this.curListType].loading = false
        const { code, data } = res
        if (code === 0) {
          const items = data.results?.items || []
          return items.filter(i => i.encrypt === '0')
        }
      })
    },
    async getCurBuzzList(listType) {
      console.log('real get buzz:', this.curListType)
      const _listType = listType || this.curListType
      const map = {
        'user': 'getUserBuzzList',
      }
      this.buzzListData[_listType].loading = true
      let list = await this[map[_listType]]()
      this.buzzListData[_listType].loading = false
      this.buzzListData[_listType].refreshing = false
      if (list.length === 0) {
        this.buzzListData[_listType].finished = true
      } else {
        this.buzzListData[_listType].data = list
        // .filter(i => i.encrypt === '0')
      }
    },
    async tip() {
      // const bsvBalance = await sensilet.getBsvBalance();
      const params = {
          receivers: [{
              address: this.curBuzzListData[0].zeroAddress,
              amount: this.actualAmount * 10 ** 8
          }],
          // broadcast: false, //default is true, sensilet will broadcast this tx. also you can send false to get a signed rawHex and broadcast yourself
      };
      if (this.selectedFT !== 'BSV') {
          params.genesis = this.ftList.find(i => i.unit === this.selectedFT).genesis
      }
      try {
        let txid = null
        if (this.selectedFT === 'BSV') {
          txid = await sensilet.transferBsv(params);
        } else {
          txid = await sensilet.transferSensibleFt(params);
        }
        console.log(txid)
        this.$toast('支付成功');
      } catch(e) {
        this.$toast('支付取消');
      }
    },
  },
  computed: {
    curBuzzListData() {
      let list = this.buzzListData[this.curListType].data
      // if (!this.showVideoInFlow) {
      //   return list.filter(i => {
      //     const hasVideo = i.attachments && i.attachments[0] && i.attachments[0].endsWith('.mp4')
      //     return !hasVideo
      //   })
      // }
      return list
    },
    actualAmount() {
      return this.selectedFT === 'BSV' ? this.amount * 0.00000001 : this.amount
    }
  },
  watch: {
    'buzzListData.user.currentPage': function() {
      this.getCurBuzzList()
    }
  },
  created() {
    this.getCurBuzzList()
  },
});
</script>

<style lang="scss" scoped>
.user-detail {
  .head {
    display: flex;
    margin-bottom: 14px;
    .username {
      font-size: 24px;
      font-weight: bold;
      margin-left: 12px;
      line-height: 40px;
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
      > * {
        margin-right: 6px;
      }
    }
  }
}
</style>
