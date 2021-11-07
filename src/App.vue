<template>
  <div id="app">
    <div class="nav">
      <h3>BuzzBit</h3>
      <div class="links">
        <router-link to="/user" v-if="hasToken">首页</router-link>
        <router-link to="/pub">广场</router-link>
        <!-- <router-link to="/login">登录</router-link> -->
        <router-link to="/decode">文件解码</router-link>
        <router-link to="/setting">设置</router-link>
        <router-link to="/about">关于</router-link>
        <div class="user">
          <button @click="auth" v-if="!hasToken">登录</button>
          <div v-else @click="auth">已登录</div>
        </div>
        <!-- <search /> -->
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import { Vue } from 'vue-property-decorator';
import { goAuth, getToken } from '@/api/metasv-buzz.ts'
import { getUrlParameterByName } from '@/utils/index';
import AppConfig from '@/config/metasv-buzz'

function getLocal(key) {
  return window.localStorage.getItem(key)
}
function setLocal(key, val) {
  return window.localStorage.setItem(key, val)
}

// import Search from "@/components/Search.vue";
let tId = null
export default Vue.extend({
  name: "App",
  props: {
  },
  components: {
    // Search
  },
  data() {
    return {
      showPub: location.host.includes('localhost'),
      hasToken: localStorage.getItem('access_token')
    };
  },
  computed: {
  },
  methods: {
    auth() {
      this.$toast('前往登录');
      goAuth()
      localStorage.clear()
      tId = setInterval(this.checkLogin, 400)
    },
    checkLogin() {
      let token = localStorage.getItem('access_token')
      if (token) {
        clearInterval(tId)
        this.hasToken = true
        if (this.isRoot()) {
          this.$router.push({ path: `/user` })
        }
      }
    },
    getAccessToken() {
      return getToken({
        'grant_type': 'authorization_code',
        code: this.code,
        // 'client_id': id,
        'redirect_uri': AppConfig.oauthSettings.redirectUri,
        'scope': 'app',
        'client_id': AppConfig.oauthSettings.clientId,
        'client_secret': AppConfig.oauthSettings.clientSecret
      }).then(res => {
        if (res.access_token) {
          this.updateAccessToken({
            accessToken: res.access_token,
            refreshToken: res.refresh_token
          })
          // window.location.reload()
        } else if (res.error_description) {
          this.$toast(res.error_description)
        }
      })
    },
    updateAccessToken(res) {
      this.accessToken = res.accessToken
      this.refreshToken = res.refreshToken
      setLocal('refresh_token', res.refreshToken)
      setLocal('access_token', res.accessToken)
    },
    isRoot() {
      return location.hash === '#/'
    }
  },
  created() {
    // 新页面 auth
    this.code = getUrlParameterByName('code')
    if (this.code) {
      this.getAccessToken().then(() => {
        window.close()
        // 关闭自身
        // this.$router.push({ path: '/user' })
        // location.href = '/#/user'
      })
    } else {
      // 未登录去公开信息流页
      if (!this.hasToken) {
        if (this.isRoot()) {
          this.$router.push({ path: `/pub` })
        }
      } else {
        if (this.isRoot()) {
          this.$router.push({ path: `/user` })
        }
      }
    }
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
