<template>
  <div class="pub-list">
      <input type="checkbox" id="showVideo" v-model="showVideoInFlow">
      <label for="showVideo">信息流中展示视频</label>
  </div>
</template>

<script>
export default ({
  name: "PubList",
  components: {
  },
  data() {
    return {
      showVideoInFlow: true
    };
  },
  methods: {
  },
  computed: {
  },
  watch: {
    'showVideoInFlow': {
      handler: function(val) {
        localStorage.setItem('showVideoInFlow', val)
      },
    }
  },
  mounted() {
    let value = localStorage.getItem('showVideoInFlow')
    if (value === null) {
      localStorage.setItem('showVideoInFlow', true)
    } else {
      this.showVideoInFlow = value === 'true'
    }
  }
});
</script>

<style scoped lang="stylus">
.pub-list {
  max-width: 600px;
  margin: 0 auto;
}
</style>
