<template>
  <div class="setting">
    <div class="item">
      <input type="checkbox" id="showVideo" :checked="showVideoInFlow" @change="onChange">
      <label for="showVideo">信息流中展示视频（不影响详情页）</label>
    </div>
    <div class="item">
      应用版本  {{$version}}
      <button @click="refresh">强制更新</button>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default ({
  name: "PubList",
  components: {
  },
  data() {
    return {
      // showVideoInFlow: true
    };
  },
  methods: {
    onChange() {
      this.$store.commit('SET_SHOW_VIDEO_IN_FLOW', !this.showVideoInFlow)
    },
    refresh() {
      window.location.reload(true)
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
}
</style>
