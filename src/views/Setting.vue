<template>
  <div class="setting">
    <div class="item">
      <input type="checkbox" id="showVideo" :checked="showVideoInFlow" @change="onChange">
      <label for="showVideo">信息流中预览视频（不影响详情页）</label>
    </div>
    <div class="item" v-if="$isInShowApp">
      <input type="checkbox" id="showneedConfirm" :checked="!needConfirm" @change="onChange1">
      <label for="showneedConfirm">小额免确认 (2000 sat)</label>
    </div>
    <div class="item">
      <router-link to="/decode">{{t('nav.decode')}}</router-link>
    </div>
    <div class="item">
      <router-link to="/about">{{t('nav.about')}}</router-link>
    </div>
    <div class="item">
      <van-button @click="refresh" color="var(--theme-color)" size="small">主动更新</van-button>
      <van-button @click="reset" color="var(--theme-color)" size="small">清除缓存</van-button>
    </div>
    <div class="item">
      <div class="version" @click="handleVersionClick">应用版本  {{$version}}</div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useI18n } from 'vue-i18n-composable'

export default ({
  name: "PubList",
  components: {
  },
  data() {
    return {
      count: 0,
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  methods: {
    onChange() {
      this.$store.commit('SET_SHOW_VIDEO_IN_FLOW', !this.showVideoInFlow)
    },
    onChange1() {
      this.$store.commit('SET_NEED_CONFIRM', !this.needConfirm)
    },
    refresh() {
      window.location.reload(true)
    },
    reset() {
      window.localStorage.clear()
      window.location.reload()
    },
    handleVersionClick() {
      this.count++
      if (this.count >= 3) {
        this.$toast('已切换调试工具，即将刷新页面')
        const value = window.localStorage.getItem('debug-tool') === 'true' ? true : false
        window.localStorage.setItem('debug-tool', !value)
        window.location.reload()
      }
      console.log('1')
    }
  },
  computed: {
    ...mapState({
      showVideoInFlow: 'showVideoInFlow',
      needConfirm: 'needConfirm'
    }),
  },
  watch: {
    // 'showVideoInFlow': {
    //   handler: function(val) {
    //     this.$store.commit('SET_SHOW_VIDEO_IN_FLOW', val)
    //   },
    // }
  },
  mounted() {
    // let value = localStorage.getItem('showVideoInFlow')
    // if (value === null) {
    //   this.$store.commit('SET_SHOW_VIDEO_IN_FLOW', true)
    // } else {
    //   this.showVideoInFlow = value === 'true'
    // }
  }
});
</script>

<style scoped lang="scss">
.setting {
  margin-bottom: 15px;
  .item {
    margin-bottom: 16px;
  }
  button {
    margin-left: 12px;
  }
}
</style>
