<template>
  <div id="app">
    <div class="nav">
      <h3>BuzzBit</h3>
      <div class="links">
        <router-link to="/">首页</router-link>
        <router-link to="/pub">广场</router-link>
        <router-link to="/decode">文件解码</router-link>
        <router-link to="/setting">设置</router-link>
        <router-link to="/about">关于</router-link>
        <!-- <search /> -->
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
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  padding: 8px;
  max-width: 600px;
  margin: 0 auto;

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
