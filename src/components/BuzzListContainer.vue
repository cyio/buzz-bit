<template>
  <div class="list-container">
    <van-tabs v-model="curListType" color="#1989fa">
      <van-tab
        v-for="item in navDataComputed"
        :title="item.title"
        :name="item.key"
        :key="item.key"
      >
        <van-loading v-show="loading" color="#1989fa" class="loading" />
        <BuzzList v-show="!loading" :buzzListData="buzzListData" />
        <van-pagination
          v-model="currentPage" :total-items="10000" :items-per-page="10"
          force-ellipses
        />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList } from '@/api/metasv-buzz.ts'
import { Tab, Tabs, Loading, Pagination } from 'vant';
// import AppConfig from '@/config/metasv-buzz'


export default {
  name: "BuzzListContainer",
  props: {
    scene: {
      type: String,
      default: 'pub'
    },
    user: {
      type: Object,
      default: () => ({})
    },
    lastBuzzTime: {
      type: Number,
    }
  },
  components: {
    BuzzList,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Loading.name]: Loading,
    [Pagination.name]: Pagination,
  },
  data() {
    return {
      loading: false,
      buzzListData: [],
      currentPage: 1,
      curListType: this.scene === 'pub' ? 'hot' : 'follow',
      navData: [
        {
          key: 'hot',
          title: '热门'
        },
        {
          key: 'new',
          title: '新帖'
        }
      ]
    }
  },
  methods: {
    getBuzzList() {
      const params = {
        Protocols: ['SimpleMicroblog'],
        metaId: this.user.metaId,
        page: "" + this.currentPage,
        pageSize: '10',
        timestamp: 0
      }
      this.loading = true
      getBuzzList(params).then(res => {
        this.loading = false
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
        page: "" + this.currentPage,
        pageSize: '10',
        timeType: "today",
        timestamp: 0
      }
      this.loading = true
      getFollowBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getHotBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '15',
        timeType: "today",
      }
      this.loading = true
      getHotBuzzList(params).then(res => {
        this.loading = false
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
        page: "" + this.currentPage,
        timeType: "today",
        timestamp: 0
      }
      this.loading = true
      getNewBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getCurBuzzList() {
      const map = {
        'my': 'getBuzzList',
        'follow': 'getFollowBuzzList',
        'hot': 'getHotBuzzList',
        'new': 'getNewBuzzList',
      }
      this[map[this.curListType]]()
    },
  },
  computed: {
    navDataComputed() {
      const priv = [
        {
          key: 'follow',
          title: '关注'
        },
        {
          key: 'my',
          title: '我的'
        }
      ]
      return this.scene === 'pub' ? this.navData : priv
    }
  },
  async created() {
    this.getCurBuzzList()
  },
  watch: {
    'curListType': function(val) {
      this.currentPage = 1
      this.getCurBuzzList()
    },
    'lastBuzzTime': function(val) {
      this.getCurBuzzList()
    },
    'currentPage': function(val) {
      this.getCurBuzzList()
    }
  },
  mounted() {
  }
};
</script>

<style lang="stylus" scoped>
.list-container {
  .loading {
    margin-top 30%;
    margin-bottom: 40px;
  }
}
</style>