<template>
  <div class="hello">
    <input type="text" placeholder="关键字" v-model="keywords" @keyup.enter="submit">
    <a :href="url" target="_blank" type="button">搜索</a>
  </div>
</template>

<script>
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
  methods: {
    submit() {
      window.open(this.url)
    }
  },
  computed: {
    url() {
      return `https://www.google.com/search?q=site%3Ashowbuzz.app%2Fdetails+${this.keywords}`
    }
  }
});
</script>

<style scoped lang="stylus">
</style>
