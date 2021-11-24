<template>
  <div id="app">
    <div class="nav">
      <div class="left">
        <span class="title" @click="goHome">BuzzBit</span>
        <span class="ver">{{$version}}</span>
        <van-loading v-show="hasToken && !isSDKLoaded" size="16px" class="sdk-loading"
        >{{`${$isMobile ? '' : 'MetaID框架...'}`}}</van-loading>
      </div>
      <div class="links">
        <router-link to="/user" v-if="hasToken || user.name">{{t('nav.home')}}</router-link>
        <router-link to="/pub/hot">{{t('nav.public')}}</router-link>
        <router-link to="/search">{{t('nav.search')}}</router-link>
        <router-link to="/decode">{{t('nav.decode')}}</router-link>
        <router-link to="/setting">{{t('nav.setting')}}</router-link>
        <router-link to="/about">{{t('nav.about')}}</router-link>
        <div class="user">
          <div v-if="hasToken || user.name" @click="authConfirm">
            <span v-if="user.name">{{user.name}}</span>
            <!-- <van-loading v-else color="#1989fa" class="loading" /> -->
          </div>
          <button @click="auth" v-else>{{t('btn.login')}}</button>
        </div>
        <!-- <search /> -->
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api'
import { goAuth, getToken } from '@/api/buzz.ts'
import { getUrlParameterByName } from '@/utils/index';
import AppConfig from '@/config/'
import { mapState } from 'vuex'
import { Dialog } from 'vant';
import { Storage } from '@/utils/index';
import SDKInit from '@/utils/sdk';
import { useI18n } from 'vue-i18n-composable/src/index'

function setLocal(key, val) {
  return window.localStorage.setItem(key, val)
}

// import Search from "@/components/Search.vue";
let tId = null
export default defineComponent({
  name: "App",
  props: {
  },
  components: {
    // Search
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  data() {
    return {
      showPub: location.host.includes('localhost'),
    };
  },
  computed: {
    ...mapState({
      user: 'user',
      accessToken: 'accessToken',
      isSDKLoaded: 'isSDKLoaded',
    }),
    hasToken() {
      return !!this.accessToken
    }
  },
  methods: {
    resetState() {
      localStorage.clear()
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
    },
    getUser() {
      const userCache = Storage.getObj('user') || '{}'
      if (userCache.metaId) {
        this.$store.commit('SET_USER', userCache);
        return
      }
      window.__metaIdJs.getUserInfo({
        accessToken: this.accessToken,
        callback: (res) => {
          if (res.code === 200) {
            this.$store.commit('SET_USER', res.data);
          } else {
            console.log('get user error: ', res)
          }
        },
      })
    },
    async initSDK(hasUserInfo) {
      await SDKInit()
      this.$store.commit('SET_SDK_LOADED', true);
      if (!hasUserInfo) {
        this.getUser()
      }
    }
  },
  created() {
    this.code = getUrlParameterByName('code')
    // 是否存在 token
    //  是否存在 user cache
    //    并行初始化 sdk
    //  sdk 是否初始化
    if (!this.hasToken && this.$route.path === '/user' && this.code) {
      this.getAccessToken(this.code).then(() => {
        if (this.hasToken) {
          // 初始化 SDK 并获取用户数据
          this.initSDK()
        }
      })
    } else {
      const userCache = Storage.getObj('user') || '{}'
      if (userCache.metaId) {
        this.$store.commit('SET_USER', userCache);
        this.initSDK(false)
      } else {
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
  display: flex;
  align-items: center;
  .title {
    cursor: pointer;
  }
  .ver {
    margin-left: 5px;
    color: #bbb7b7;
    font-size: 12px;
  }
  .sdk-loading {
    font-size: 12px;
    margin-left: 6px;
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
