<template>
  <div class="list-container">
    <!-- 搜索顶部 -->
    <div class="search-wrap" v-show="curListType === 'search'" >
      <van-search
        v-model="keywords"
        placeholder="请输入关键词" @search="onSearch"
        class="search-input"
        autofocus
      />
      <van-button color="var(--theme-color)" @click="onSearch" size="small" :disabled='keywords === ""' class="search-btn">搜 索</van-button>
      <van-dropdown-menu v-show="searchChain" active-color="#c68230">
        <van-dropdown-item v-model="timeValue" :options="timeOptions"
          @change="onSearch"
         />
      </van-dropdown-menu>
    </div>
    <div class="options">
      <div class="item">
        <input type="checkbox" id="searchChain" v-model="searchChain">
        <label for="searchChain">{{t('btn.searchChain')}}</label>
      </div>
      <!-- <div class="item">
        <input type="checkbox" id="caseInsensitive" v-model="caseInsensitive">
        <label for="caseInsensitive">{{t('btn.caseInsensitive')}}</label>
      </div> -->
    </div>
    <!-- 搜索内容 -->
    <div v-if="showResult && !buzzListData[curListType].loading">
      <div v-if="curBuzzListData.length || buzzListData.search.currentPage > 1">
        <BuzzList :buzzListData="curBuzzListData" />
        <van-pagination
          v-model="buzzListData[curListType].currentPage" :total-items="10000" :items-per-page="10"
          force-ellipses
        />
      </div>
      <div class="no-result" v-else>没有结果</div>
    </div>
    <div class="custom-content" v-else>
      <QuoteCard v-if="!buzzListData[curListType].loading" />
      <van-loading v-else color="var(--theme-color)" class="loading">
        <QuoteCard />
      </van-loading>
    </div>
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import QuoteCard from "@/components/QuoteCard.vue";
import { getSearchBuzzList } from '@/api/buzz.ts'
import { Tab, Tabs, Loading, Pagination, Search, PullRefresh, List, DropdownMenu, DropdownItem } from 'vant';
import { useI18n } from 'vue-i18n-composable'
import { parseHighlight } from '@/utils/convert'

function getTimeOptions() {
  const now = new Date();
  const hour = 3.6e+6
  const day = 8.64e+7
  const week = 6.048e+8
  const month = 2.628e+9
  const year = 3.156e+10
  return [
    { text: '任意时间', value: 0 },
    { text: '近 1 小时', value: now - hour},
    { text: '近 24 小时', value: now - day },
    { text: '近 1 周', value: now - week },
    { text: '近 1 月', value: now - month },
    { text: '近 1 年', value: now - year },
  ]
}

export default {
  name: "SearchView",
  props: {
    scene: {
      type: String,
      default: 'pub'
    },
    user: {
      type: Object,
      default: () => ({})
    },
    lastBuzzTxId: {
      type: Number,
    }
  },
  components: {
    BuzzList,
    QuoteCard,
    [Tab.name]: Tab,
    [Tabs.name]: Tabs,
    [Loading.name]: Loading,
    [Pagination.name]: Pagination,
    [Search.name]: Search,
    [PullRefresh.name]: PullRefresh,
    [List.name]: List,
    [DropdownMenu.name]: DropdownMenu,
    [DropdownItem.name]: DropdownItem,
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  data() {
    return {
      buzzListData: {
        'search': {
          data: [],
          loading: false,
          refreshing: false,
          finished: false,
          currentPage: 1,
        },
      },
      curListType: 'search',
      keywords: '',
      showVideoInFlow: true,
      caseInsensitive: false,
      searchChain: false,
      showResult: false,
      timeValue: 0,
      timeOptions: getTimeOptions()
    }
  },
  methods: {
    getSearchBuzzList() {
      const params = {
        page: "" + this.buzzListData[this.curListType].currentPage,
        pageSize: '10',
        searchWord: this.caseInsensitive ? '(?i)' + this.keywords : this.keywords,
        timestamp: 0
      }
      this.searchLoading = true
      return getSearchBuzzList(params).then(res => {
        this.searchLoading = false
        const { code, data } = res
        if (code === 0) {
          return data.results?.items || []
        }
      })
    },
    async getCurBuzzList(listType) {
      console.log('real get buzz:', this.curListType)
      const _listType = listType || this.curListType
      const map = {
        'search': 'getSearchBuzzList',
      }
      this.buzzListData[_listType].loading = true
      let list = await this[map[_listType]]()
      this.buzzListData[_listType].loading = false
      this.buzzListData[_listType].refreshing = false
      if (list.length === 0) {
        this.buzzListData[_listType].finished = true
        this.buzzListData[_listType].data = []
      } else {
        this.buzzListData[_listType].data = list
        // .filter(i => i.encrypt === '0')
      }
      this.showResult = true
    },
    searchChainQuery(listType) {
      const _listType = listType || this.curListType
      const map = {
        'search': 'getSearchBuzzList',
      }
      this.buzzListData[_listType].loading = true
      const limit = 30
      const fromIndex = limit * (this.buzzListData[this.curListType].currentPage - 1)
      const fromTime = parseInt(this.timeValue / 1000)
      const query = {
        q: this.keywords,
        limit,
        from: fromIndex,
        fromTime
      }
      fetch(`https://api.bitails.io/search?${new URLSearchParams(query)}`).then(
        res => res.json()
      ).then(json => {
        this.buzzListData[_listType].loading = false
        this.buzzListData[_listType].refreshing = false
        this.buzzListData[_listType].finished = true
        this.showResult = true
        if (!json) {
          return
        }
        const { ops: { results } } = json
        results.sort((a, b) => b.time - a.time)
        this.buzzListData[_listType].data = results
          .map(i => {
            return {
              content: parseHighlight(i.highlight[0])?.content || i.highlight[0],
              _content: i.highlight[0],
              txId: i.txid,
              timestamp: i.time * 1000
            }
          })
      })
    },
    onSearch() {
      if (!this.keywords) {
          return
      }
      this.buzzListData.search.data = []
      this.buzzListData.search.finished = false
      this.buzzListData.search.currentPage = 1
      this.showResult = false
      if (this.searchChain) {
        this.searchChainQuery()
      } else {
        this.getCurBuzzList()
      }
    }
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
  },
  watch: {
    'buzzListData.search.currentPage': function() {
      if (this.searchChain) {
        this.searchChainQuery()
      } else {
        this.getCurBuzzList()
      }
    },
    keywords(val) {
      if (val.trim() === '') {
        this.showResult = false;
      }
    }
  },
  created() {
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
      flex: 1;
    }
  }
  .options {
    margin: 15px 0;
    font-size: 14px;
  }
  .no-result {
    text-align: center;
    margin-top: 200px;
    color: var(--theme-color);
    font-size: 14px;
  }
}
</style>
<style>
@media (min-width:600px) {
  .van-dropdown-item--down {
    width: 600px;
    left: 50%;
    max-width: 600px;
    transform: translateX(-50%);
  }
}
</style>