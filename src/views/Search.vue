<template>
  <div class="list-container">
    <div class="search-wrap" v-show="curListType === 'search'" >
      <van-search
        v-model="keywords"
        placeholder="请输入关键词" @search="onSearch"
        class="search-input"
        autofocus
      />
      <van-button color="var(--theme-color)" @click="onSearch" size="small" :disabled='keywords === ""' class="search-btn">搜 索</van-button>
    </div>
    <van-loading v-show="buzzListData[curListType].loading" color="var(--theme-color)" class="loading" />
    <BuzzList :buzzListData="curBuzzListData" v-show="!buzzListData[curListType].loading" />
    <van-pagination
      v-show="curBuzzListData.length > 0 && !buzzListData[curListType].loading"
      v-model="buzzListData[curListType].currentPage" :total-items="10000" :items-per-page="10"
      force-ellipses
    />
  </div>
</template>
<script>
import BuzzList from "@/components/BuzzList.vue";
import { getSearchBuzzList } from '@/api/buzz.ts'
import { Tab, Tabs, Loading, Pagination, Search, PullRefresh, List } from 'vant';
import { useI18n } from 'vue-i18n-composable/src/index'

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
      showVideoInFlow: true
    }
  },
  methods: {
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
      } else {
        this.buzzListData[_listType].data = list
        // .filter(i => i.encrypt === '0')
      }
    },
    onSearch() {
      // this.buzzListData.search.data = []
      this.getCurBuzzList()
    }
  },
  computed: {
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
    'buzzListData.search.currentPage': function(val) {
      this.getCurBuzzList()
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
}
</style>