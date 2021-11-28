<template>
  <div class="list-container">
    <van-tabs v-model="curListType" color="var(--theme-color)">
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
          <van-button color="var(--theme-color)" @click="onSearch" size="small" :disabled='keywords === ""' class="search-btn">搜 索</van-button>
        </div>
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
      </van-tab>
    </van-tabs>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList, getSearchBuzzList } from '@/api/buzz.ts'
import { Tab, Tabs, Loading, Pagination, Search, PullRefresh, List } from 'vant';
import { useI18n } from 'vue-i18n-composable/src/index'

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
  setup() {
    return {
      ...useI18n(),
    }
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
      },
      curListType: this.scene === 'pub' ? 'hot' : 'follow',
      navData: [
        {
          key: 'hot',
          title: this.t('nav.hot')
        },
        {
          key: 'new',
          title: this.t('nav.new')
        },
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
    async getCurBuzzList(listType, addLatest = false) {
      // console.log('real get buzz:', this.curListType)
      const _listType = listType || this.curListType
      const map = {
        'my': 'getBuzzList',
        'follow': 'getFollowBuzzList',
        'hot': 'getHotBuzzList',
        'new': 'getNewBuzzList',
      }
      let list = await this[map[_listType]]()
      this.buzzListData[_listType].loading = false
      this.buzzListData[_listType].refreshing = false
      if (list.length === 0) {
        this.buzzListData[_listType].finished = true
      } else {
        if (addLatest) {
          if (list[0].txId !== this.buzzListData[_listType].data[0].txId) {
            this.buzzListData[_listType].data.unshift(list[0])
          }
        } else {
          this.buzzListData[_listType].data.push(...list)
        }
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
      if (this.buzzListData[listType].finished) return
      this.buzzListData[listType].loading = true;
      if (this.buzzListData[listType].data.length > 0) {
        this.buzzListData[listType].currentPage++
      }
      if (this.buzzListData[listType].currentPage > 1) {
        this.getCurBuzzList(listType)
      }
    },
    onSearch() {
      this.buzzListData.search.data = []
      this.buzzListData.search.loading = true
      this.getCurBuzzList()
    }
  },
  computed: {
    navDataComputed() {
      const priv = [
        {
          key: 'follow',
          title: this.t('nav.follow')
        },
        {
          key: 'my',
          title: this.t('nav.my')
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
      handler: function(val, old) {
        // console.info('watch', val, old)
        this.buzzListData[this.curListType].currentPage = 1
        this.buzzListData[this.curListType].data = []
        // this.buzzListData[this.curListType].loading = true;
        this.getCurBuzzList(val)
        if (this.$route.path !== `/pub/${val}` && !/follow|my/.test(val) && old) {
          this.$router.push({ path: `/pub/${val}` })
        }
      },
      immediate: true,
    },
    // 用户发帖后，刷新
    'lastBuzzTime': function(val) {
      setTimeout(() => {
        this.getCurBuzzList('', true)
      }, 400)
    },
  },
  created() {
    const { params } = this.$route
    if (params.type && params.type !== this.curListType) {
      // console.log('created listType changed')
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