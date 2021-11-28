<template>
  <div class="setting">
    <div class="item">
      <input type="checkbox" id="showVideo" :checked="showVideoInFlow" @change="onChange">
      <label for="showVideo">信息流中展示视频（不影响详情页）</label>
    </div>
    <div class="item">
      <router-link to="/decode">{{t('nav.decode')}}</router-link>
    </div>
    <div class="item">
      应用版本  {{$version}}
      <button @click="refresh">强制更新</button>
      <button @click="reset">清除缓存(如遇登录问题)</button>
    </div>
    <div class="item">
      <router-link to="/about">{{t('nav.about')}}</router-link>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { useI18n } from 'vue-i18n-composable/src/index'

export default ({
  name: "PubList",
  components: {
  },
  data() {
    return {
      // showVideoInFlow: true
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
    refresh() {
      window.location.reload(true)
    },
    reset() {
      window.localStorage.clear()
      window.location.reload()
    }
  },
  computed: {
    ...mapState({
      showVideoInFlow: 'showVideoInFlow'
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
}
</style>
