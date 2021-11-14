<template>
  <div id="app">
    <div class="nav">
      <div class="left">
        <span class="title" @click="goHome">BuzzBit</span>
        <span class="ver">{{$version}}</span>
      </div>
      <div class="links">
        <router-link to="/user" v-if="hasToken || user.name">主页</router-link>
        <router-link to="/pub/hot">广场</router-link>
        <!-- <router-link to="/login">登录</router-link> -->
        <router-link to="/decode">解码</router-link>
        <router-link to="/setting">设置</router-link>
        <router-link to="/about">关于</router-link>
        <div class="user">
          <div v-if="hasToken || user.name" @click="authConfirm">
            <span v-if="user.name">{{user.name}}</span>
            <van-loading v-else color="#1989fa" class="loading" />
          </div>
          <button @click="auth" v-else>登录</button>
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
import { mapState } from 'vuex'
import { Dialog } from 'vant';
import { Storage } from '@/utils/index';

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
      hasToken: !!this.accessToken,
    };
  },
  computed: {
    ...mapState({
      user: 'user',
      accessToken: 'accessToken',
    }),
  },
  methods: {
    resetState() {
      localStorage.clear()
      this.hasToken = false;
      this.$store.commit('SET_USER', {});
    },
    auth() {
      this.$toast('前往登录');
      this.resetState()
      goAuth()
      tId = setInterval(this.checkLogin, 400)
    },
    authConfirm() {
      Dialog.confirm({
        // title: '标题',
        message: '前往登录/切换帐号',
      })
        .then(() => {
          this.auth()
          // on confirm
        })
        .catch(() => {
          // on cancel
        });
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
    getAccessToken(code) {
      return getToken({
        'grant_type': 'authorization_code',
        code,
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
          this.hasToken = true
        } else if (res.error_description) {
          this.$toast(res.error_description)
        }
      })
    },
    updateAccessToken(res) {
      this.$store.commit('SET_ACCESS_TOKEN', res.accessToken)
      // this.accessToken = res.accessToken
      this.refreshToken = res.refreshToken
      setLocal('refresh_token', res.refreshToken)
      // setLocal('access_token', res.accessToken)
    },
    isRoot() {
      return location.hash === '#/'
    },
    goHome() {
      const { path } = this.$route
      if (path === '/user' || path === '/pub/hot') {
      } else {
        this.$router.push('/')
      }
    }
  },
  created() {
    // 新页面 auth
    this.code = getUrlParameterByName('code')
    if (!this.hasToken && this.$route.path === '/user' && this.code) {
      this.getAccessToken(this.code)
    } else {
      const userCache = Storage.getObj('user') || '{}'
      if (userCache.metaId) {
        this.$store.commit('SET_USER', userCache);
      }
    }
  }
});
</script>

<style lang="scss" scoped>

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 25px auto;
  max-width: 600px;
  color: var(--theme-color);
}

.left {
  .title {
    cursor: pointer;
  }
  .ver {
    margin-left: 5px;
    color: #bbb7b7;
    font-size: 12px;
  }
}

.links {
  display: flex;
  align-items: center;
  color: var(--theme-color);
  > a {
    margin-right: 6px;
    white-space: nowrap;
  }
}

.user {
  div:hover {
    cursor: pointer
  }
}
</style>
<style>
:root {
  --theme-color: #ab490d;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 8px;
  max-width: 600px;
  margin: 0 auto;
}
</style>
