<template>
  <div class="hello">
    <input type="text" placeholder="关键字" v-model="keywords" @keyup.enter="submit">
    <a :href="url" target="_blank" type="button">搜索</a>
  </div>
</template>

<script>
import { Component, Prop, Vue } from 'vue-property-decorator';

export default Vue.extend({
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
h3
  margin 40px 0 0

ul
  list-style-type none
  padding 0

li
  display inline-block
  margin 0 10px

a
  margin-left 10px

input 
  width: 120px;
</style>
