<template>
  <div id="app">
    <div class="nav">
      <h3>BuzzBit</h3>
      <div class="links">
        <router-link to="/">首页</router-link>
        <router-link to="/pub" v-show="showPub">广场</router-link>
        <router-link to="/about">关于</router-link>
        <search />
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import { Vue } from 'vue-property-decorator';
import Search from "@/components/Search.vue";

export default Vue.extend({
  name: "BuzzList",
  props: {
  },
  components: {
    Search
  },
  data() {
    return {
      showPub: location.host.includes('localhost')
    };
  },
  computed: {
  }
});
</script>

<style lang="stylus" scoped>
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  // color #2c3e50
  margin-top 10px

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 600px;
}

.links {
  display: flex;
  > a {
    margin-right 6px
    white-space: nowrap;
  }
}
</style>
