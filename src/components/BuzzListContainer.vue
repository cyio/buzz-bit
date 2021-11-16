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
        <!-- <van-loading v-show="loading" color="#1989fa" class="loading" /> -->
        <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
          <van-list
            v-model="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <BuzzList :buzzListData="curBuzzListData" :key="item.key" />
          </van-list>
        </van-pull-refresh>
        <!-- <van-pagination
          v-show="buzzListData[curListType].length > 0 && !loading"
          v-model="currentPage" :total-items="10000" :items-per-page="10"
          force-ellipses
        /> -->
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList, getSearchBuzzList } from '@/api/metasv-buzz.ts'
import { Tab, Tabs, Loading, Pagination, Search, PullRefresh, List } from 'vant';

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
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
  },
  data() {
    return {
      loading: false,
      refreshing: false,
      finished: false,
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
        pageSize: '6',
        timestamp: 0
      }
      return getBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          return res.data.results?.items || []
        }
      })
    },
    getFollowBuzzList() {
      const params = {
        metaId: this.user.metaId,
        page: "" + this.currentPage,
        pageSize: '6',
        timeType: "today",
        timestamp: 0
      }
      return getFollowBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          return res.data.results?.items || []
        }
      })
    },
    getHotBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '6',
        timeType: "today",
      }
      return getHotBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          return res.data.results?.items || []
        }
      })
    },
    getNewBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '6',
        timeType: "today",
        timestamp: 0
      }
      return getNewBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          return res.data.results?.items || []
        }
      })
    },
    getSearchBuzzList() {
      const params = {
        page: "" + this.currentPage,
        pageSize: '6',
        searchWord: this.keywords,
        timestamp: 0
      }
      return getSearchBuzzList(params).then(res => {
        const { code, data } = res
        if (code === 0) {
          return res.data.results?.items || []
        }
      })
    },
    async getCurBuzzList(triggerLoading = true) {
      const map = {
        'my': 'getBuzzList',
        'follow': 'getFollowBuzzList',
        'hot': 'getHotBuzzList',
        'new': 'getNewBuzzList',
        'search': 'getSearchBuzzList',
      }
      if (triggerLoading) {
        // this.loading = true
      }
      let list = await this[map[this.curListType]]()
      this.buzzListData[this.curListType].push(...list.filter(i => i.encrypt === '0'))
      console.log(this.buzzListData[this.curListType])
      this.loading = false
      this.refreshing = false
    },
    async onRefresh(){
      if (this.refreshing) {
        this.buzzListData[this.curListType] = []
        this.currentPage = 1
        this.getCurBuzzList()
      }
    },
    onLoad() {
      this.finished = false;

      this.loading = true;
      this.currentPage++
      this.getCurBuzzList()
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
      setTimeout(() => {
        this.getCurBuzzList(false)
      }, 400)
    },
    'currentPage': function(val) {
      // this.getCurBuzzList()
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

<style lang="scss" scoped>
.list-container {
  .loading {
    margin-top: 30%;
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