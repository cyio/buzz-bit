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
    </div>
    <div class="options">
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
      <div class="no-result" v-else>没有查询到，换个搜索词试试</div>
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
import { Tab, Tabs, Loading, Pagination, Search, PullRefresh, List } from 'vant';
import { useI18n } from 'vue-i18n-composable'

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
      showResult: false
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
    onSearch() {
      this.buzzListData.search.data = []
      this.buzzListData.search.finished = false
      this.buzzListData.search.currentPage = 1
      this.showResult = false
      this.getCurBuzzList()
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
      this.getCurBuzzList()
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
      width: 80%;
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