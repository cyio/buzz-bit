<template>
  <div class="hello">
    <button @click="send">send</button>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default ({
  name: "BuzzList",
  props: {
  },
  components: {
  },
  data() {
    return {
      keywords: ''
    };
  },
  // ...mapState({
  //   user: 'user',
  //   accessToken: 'accessToken',
  //   isSDKLoaded: 'isSDKLoaded',
  //   needConfirm: 'needConfirm'
  // }),
  methods: {
    send() {
      const config = {
        nodeName: "Test2021",
        metaIdTag: "metaid",
        brfcId: "b29d32928a58",
        accessToken: localStorage.getItem('access_token'),
        encrypt: 0,
        payCurrency: "BSV",
        // payTo,
        path: '/Protocols/Test2021',
        dataType: "application/json",
        data: 'a-a',
        // needConfirm: this.$isInShowApp && this.needConfirm,
        // checkOnly: true, // dev
        callback: (res) => {
          console.log('success: ', res)
        },
        onCancel: (res) => {
          console.log('cancel: ', res)
        }
      }
      console.log('config: ', config)
      window.__metaIdJs.addProtocolNode_(config);
    }
  },
  computed: {
    url() {
      return `https://www.google.com/search?q=site%3Ashowbuzz.app%2Fdetails+${this.keywords}`
    }
  }
});
</script>

<style scoped lang="scss">
</style>
