<template>
  <div class="list-container">
    <ui-tabs
      :tabOptions="navDataComputed"
      :activeTab="curListType"
      @click="onClickTab"
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
        @load="onLoad(curListType)"
        :key="curListType"
      >
        <!-- <div class="init-loading" v-if="curBuzzListData.length === 0 && buzzListData[curListType].loading">数据</div> -->
        <BuzzList :buzzListData="curBuzzListData" :key="curListType" />
        <!-- 定制首次加载界面 -->
        <template v-if="curBuzzListData.length === 0" v-slot:loading>
            <van-loading color="var(--theme-color)" class="loading"></van-loading>
            <!-- <QuoteCard name="for-list" /> -->
        </template>
      </van-list>
      <!-- </van-pull-refresh> -->
    </ui-tabs>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import QuoteCard from "@/components/QuoteCard.vue";
import UITabs from "@/components/Tabs.vue";
import { getBuzzList, getFollowBuzzList, getHotBuzzList, getNewBuzzList, getSearchBuzzList, getBuzz } from '@/api/buzz.ts'
import { Loading, Pagination, Search, PullRefresh, List } from 'vant';
import { useI18n } from 'vue-i18n-composable'
import { mapState } from 'vuex'

export default {
  name: "BuzzListContainer",
  props: {
    scene: {
      type: String,
      default: 'pub'
    },
    lastBuzzTxId: {
      type: String,
    },
    lastBuzz: {
      type: Object,
    },
    lastBuzzUseEncrypt: {
      type: Boolean,
    },
  },
  components: {
    BuzzList,
    QuoteCard,
    'ui-tabs': UITabs,
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
      curListType: this.$route.path.split('/').pop(),
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
      isActivated: false,
      showVideoInFlow: true
    }
  },
  methods: {
    onClickTab(val) {
      if (val === this.curListType) {
          this.buzzListData[this.curListType].currentPage = 1
          this.buzzListData[this.curListType].data = []
          this.buzzListData[this.curListType].loading = true;
          this.getCurBuzzList()
          return
      }
      this.$router.push({ path: `/pub/${val}` })
    },
    getBuzzList() {
      const params = {
        Protocols: ['SimpleMicroblog', 'WebotBuzz'],
        MetaId: this.user.metaId,
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
        MetaId: this.user.metaId,
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
        MetaId: this.user.metaId,
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
        MetaId: this.user.metaId,
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
        MetaId: this.user.metaId,
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
          const socialList = this.user?.socialList
          // console.log(socialList, this.user2)
          if (socialList) {
            list = list.filter(i => {
              let value = !socialList.blackList.includes(i.metaId)
              // console.log('是否展示', value, i.metaId)
              return value
            })
          }
          this.buzzListData[_listType].data.push(...list)
        }
        // .filter(i => i.encrypt === '0')
      }
    },
    onRefresh(){
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
    ...mapState({
      user: 'user',
    }),
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
      // if (!this.showVideoInFlow) {
      //   return list.filter(i => {
      //     const hasVideo = i.attachments && i.attachments[0] && i.attachments[0].endsWith('.mp4')
      //     return !hasVideo
      //   })
      // }
      return list
    }
  },
  watch: {
    // 用户发帖后，刷新
    'lastBuzzTxId': function(txId) {
      setTimeout(() => {
        // this.getCurBuzzList('', true)
        // 加密内容仅我的列表可展示，切换过去
        if (this.lastBuzzUseEncrypt) {
          this.curListType = 'my'
          return
        }
        if (this.lastBuzz.content) {
          this.buzzListData[this.curListType].data.unshift(this.lastBuzz)
          return
        }
        getBuzz({ txId, MetaId: this.user.metaId }).then(res => {
          const { code, data } = res
          if (code === 0) {
            const items = data.results?.items || []
            if (items.length) {
              const buzz = items[0]
              if (buzz) {
                this.buzzListData[this.curListType].data.unshift(buzz)
              }
            } else {
              // this.$toast('数据未查询到，请稍后再试')
            }
          }
        })
      }, 100)
    },
  },
  created() {
    this.getCurBuzzList(this.curListType)
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