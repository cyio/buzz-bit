<template>
  <div class="pub-list">
    <div class="list-nav">
      <div class="item" @click="curListType = 'hot'" role="button">热门</div>
      <div class="item" @click="curListType = 'new'" role="button">最新</div>
      <!-- <div class="item follow" @click="curListType = 'follow'" role="button">关注</div> -->
      <!-- <div class="item my" @click="curListType = 'my'" role="button">我的</div> -->
    </div>
    <BuzzList :buzzListData="buzzListData" />
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList } from '@/api/metasv-buzz.ts'
// import AppConfig from '@/config/metasv-buzz'


export default {
  name: "PubList",
  components: {
    BuzzList
  },
  data() {
    return {
      buzzListData: [],
      curListType: 'hot',
      user: {},
    }
  },
  methods: {
    getBuzzList() {
      const params = {
        Protocols: ['SimpleMicroblog'],
        metaId: this.user.metaId,
        page: '1',
        pageSize: '10',
        timestamp: 0
      }
      getBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getFollowBuzzList() {
      const params = {
        metaId: this.user.metaId,
        page: '1',
        pageSize: '10',
        timeType: "today",
        timestamp: 0
      }
      getFollowBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getHotBuzzList() {
      const params = {
        page: '1',
        pageSize: '15',
        timeType: "today",
      }
      getHotBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getNewBuzzList() {
      const params = {
        page: '1',
        pageSize: '15',
        timeType: "today",
        timestamp: 0
      }
      getNewBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getCurBuzzList() {
      const map = {
        // 'my': 'getBuzzList',
        // 'follow': 'getFollowBuzzList',
        'hot': 'getHotBuzzList',
        'new': 'getNewBuzzList',
      }
      this[map[this.curListType]]()
    },
  },
  computed: {
  },
  async created() {
    this.getCurBuzzList()
  },
  watch: {
    'curListType': function(val) {
      this.getCurBuzzList()
    }
  },
  mounted() {
  }
};
</script>

<style lang="stylus" scoped>
.pub-list {
  max-width: 600px;
  margin: 0 auto;
  .list-nav {
      display: flex;
  }
}
</style>