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
            placeholder="请输入关键词" @search="onSearch"
            class="search-input"
          />
          <van-button color="#1989fa" @click="onSearch" size="small" :disabled='keywords === ""' class="search-btn">搜 索</van-button>
        </div>
        <template v-if="curListType !== 'search'">
          <!-- <van-pull-refresh v-model="buzzListData[curListType].refreshing" @refresh="onRefresh"> -->
            <van-list
              v-model="buzzListData[curListType].loading"
              :finished="buzzListData[curListType].finished"
              finished-text="没有更多了"
              @load="onLoad(item.key)"
              :key="item.key"
            >
              <BuzzList :buzzListData="curBuzzListData" :key="item.key" />
            </van-list>
          <!-- </van-pull-refresh> -->
        </template>
        <template v-else>
          <van-loading v-show="buzzListData[curListType].loading" color="#1989fa" class="loading" />
          <BuzzList :buzzListData="curBuzzListData" :key="item.key" v-show="!buzzListData[curListType].loading" />
          <van-pagination
            v-show="buzzListData[curListType].length > 0 && !buzzListData[curListType].loading"
            v-model="buzzListData[curListType].currentPage" :total-items="10000" :items-per-page="10"
            force-ellipses
          />
        </template>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList, getSearchBuzzList } from '@/api/buzz.ts'
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
      buzzListData: {
        'hot': {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        },
        'new': {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        },
        'follow': {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        },
        'my': {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        },
        'search': {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        },
      },
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
        page: "" + this.buzzListData[this.curListType].currentPage,
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
        page: "" + this.buzzListData[this.curListType].currentPage,
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
        page: "" + this.buzzListData[this.curListType].currentPage,
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
        page: "" + this.buzzListData[this.curListType].currentPage,
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
        page: "" + this.buzzListData[this.curListType].currentPage,
        pageSize: '10',
        searchWord: this.keywords,
        timestamp: 0
      }
      this.searchLoading = true
      return getSearchBuzzList(params).then(res => {
        this.searchLoading = false
        const { code, data } = res
        if (code === 0) {
          return res.data.results?.items || []
        }
      })
    },
    async getCurBuzzList(listType) {
      console.log('real get buzz:', this.curListType)
      const _listType = listType || this.curListType
      const map = {
        'my': 'getBuzzList',
        'follow': 'getFollowBuzzList',
        'hot': 'getHotBuzzList',
        'new': 'getNewBuzzList',
        'search': 'getSearchBuzzList',
      }
      let list = await this[map[_listType]]()
      this.buzzListData[_listType].loading = false
      this.buzzListData[_listType].refreshing = false
      if (list.length === 0) {
        this.buzzListData[_listType].finished = true
      } else {
        this.buzzListData[_listType].data.push(...list)
        // .filter(i => i.encrypt === '0')
      }
    },
    async onRefresh(){
      if (this.buzzListData[this.curListType].refreshing) {
        this.buzzListData[this.curListType].data = []
        this.buzzListData[this.curListType].currentPage = 1
         
        this.getCurBuzzList()
      }
    },
    // 页面首次加载会触发
    onLoad(listType) {
      console.log('onLoad, ', listType, this.curListType)
      // if (this.buzzListData[listType].loading) return
      if (this.buzzListData[listType].finished) return
      if (listType === 'search' && this.curBuzzListData.length === 0) {
        return
      }
      // this.buzzListData[this.curListType].finished = false;
      console.log('onLoad trigger loading ', listType, this.buzzListData[listType].currentPage)
      this.buzzListData[listType].loading = true;
      if (this.buzzListData[listType].data.length > 0) {
        this.buzzListData[listType].currentPage++
      }
      this.getCurBuzzList(listType)
    },
    onSearch() {
      this.buzzListData[this.curListType].data = []
      this.getCurBuzzList()
    }
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
      let list = this.buzzListData[this.curListType].data
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
    // 切换 Tab
    'curListType': {
      handler: function(val) {
        console.info('watch')
        this.curListType = val
        this.buzzListData[this.curListType].currentPage = 1
        this.buzzListData[this.curListType].data = []
        if (val === 'search') {
          this.buzzListData[this.curListType].loading = false
        } else {
          this.getCurBuzzList(val)
        }
        if (this.$route.path !== `/pub/${val}` && val !== 'follow' && val !== 'my') {
          this.$router.push({ path: `/pub/${val}` })
        }
      },
      // immediate: true,
    },
    // 用户发帖后，刷新
    'lastBuzzTime': function(val) {
      setTimeout(() => {
        this.getCurBuzzList()
      }, 400)
    },
    'currentPage': function(val) {
      if (this.curListType === 'search' && this.keywords !== '') {
        this.getCurBuzzList()
      }
    }
  },
  created() {
    const { params } = this.$route
    if (params.type && params.type !== this.curListType) {
      console.log('created listType changed')
      this.curListType = params.type
    }
  },
  mounted() {
    const value = localStorage.getItem('showVideoInFlow')
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