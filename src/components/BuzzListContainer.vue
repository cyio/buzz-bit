<template>
  <div class="list-container">
    <van-tabs v-model="curListType" color="#1989fa">
      <van-tab
        v-for="item in navDataComputed"
        :title="item.title"
        :name="item.key"
        :key="item.key"
      >
        <div class="search-wrap" v-show="curListType === 'search'" >
          <van-search
            v-model="keywords"
            placeholder="请输入关键词" @search="getSearchBuzzList"
            class="search-input"
          />
          <van-button color="#1989fa" @click="getSearchBuzzList" size="small" :disabled='keywords === ""' class="search-btn">搜 索</van-button>
        </div>
        <van-loading v-show="loading" color="#1989fa" class="loading" />
        <BuzzList v-show="!loading" :buzzListData="curBuzzListData" :key="item.key" />
        <van-pagination
          v-show="buzzListData[curListType].length > 0 && !loading"
          v-model="currentPage" :total-items="10000" :items-per-page="10"
          force-ellipses
        />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList, getSearchBuzzList } from '@/api/metasv-buzz.ts'
import { Tab, Tabs, Loading, Pagination, Search } from 'vant';
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
    [Search.name]: Search,
  },
  data() {
    return {
      loading: false,
      buzzListData: {
        'hot': [],
        'new': [],
        'follow': [],
        'my': [],
        'search': [],
      },
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
        },
        {
          key: 'search',
          title: '搜索'
        }
      ],
      keywords: '',
      showVideoInFlow: true
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
          this.buzzListData.my = items.filter(i => i.encrypt === '0')
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
      // return
      getFollowBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData.follow = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getHotBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '10',
        timeType: "today",
      }
      this.loading = true
      getHotBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData.hot = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getNewBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '10',
        timeType: "today",
        timestamp: 0
      }
      this.loading = true
      getNewBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData.new = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getSearchBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '10',
        searchWord: this.keywords,
        timestamp: 0
      }
      this.loading = true
      getSearchBuzzList(params).then(res => {
        this.loading = false
        const { code, data } = res
        if (code === 0) {
          const items = res.data.results?.items || []
          this.buzzListData.search = items.filter(i => i.encrypt === '0')
        }
      })
    },
    getCurBuzzList() {
      const map = {
        'my': 'getBuzzList',
        'follow': 'getFollowBuzzList',
        'hot': 'getHotBuzzList',
        'new': 'getNewBuzzList',
        'search': 'getSearchBuzzList',
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
    },
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
  watch: {
    'curListType': function(val) {
      this.currentPage = 1
      this.curListType = val
      if (val === 'search') {
        this.loading = false
        this.buzzListData.search = []
      } else {
        this.getCurBuzzList()
      }
      if (this.$route.path !== `/pub/${val}` && val !== 'follow' && val !== 'my') {
        this.$router.push({ path: `/pub/${val}` })
      }
    },
    'lastBuzzTime': function(val) {
      this.getCurBuzzList()
    },
    'currentPage': function(val) {
      this.getCurBuzzList()
    }
  },
  created() {
  },
  mounted() {
    let { params } = this.$route
    if (params.type) {
      if (params.type === this.curListType) {
        this.getCurBuzzList()
      } else {
        this.curListType = params.type
      }
    } else {
      this.getCurBuzzList()
    }
    let value = localStorage.getItem('showVideoInFlow')
    this.showVideoInFlow = value === 'true' || value === null
  }
};
</script>

<style lang="stylus" scoped>
.list-container {
  .loading {
    margin-top 30%;
    margin-bottom: 30%;
    text-align: center;
  }
  .search-wrap {
    display: flex;
    align-items: center;
    .search-input {
      width: 80%;
    }
  }
}
</style>