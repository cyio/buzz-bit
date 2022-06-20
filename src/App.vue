<template>
  <div id="app">
    <div class="nav">
      <div class="left">
        <span class="title" @click="goHome">BuzzBit</span>
        <span class="ver">{{$version}}</span>
        <van-loading v-show="hasToken && !isSDKLoaded" size="16px" class="sdk-loading"
        >{{loadingStatus}}</van-loading>
      </div>
      <div class="links">
        <div class="link" v-for="item of links" :key="item.name">
          <template v-if="item.enable">
            <div v-if="item.isExternal">
                <a :href="item.to" target="_blank">
                  <img class="custom-icon" :src="item.img" />
                </a>
            </div>
            <router-link v-else :to="item.to">
              <nav-item :name="item.name" :is-active="item.name === currentRouteName" />
            </router-link>
          </template>
        </div>
        <div class="user">
          <div v-if="hasToken || user.name" @click="authConfirm">
            <span v-if="user.name">{{user.name}}</span>
            <!-- <van-loading v-else color="var(--theme-color)" class="loading" /> -->
          </div>
          <van-button @click="auth" v-else color="var(--theme-color)" size="small">{{t('btn.login')}}</van-button>
        </div>
        <!-- <search /> -->
      </div>
    </div>
    <keep-alive exclude="Detail">
      <router-view :key="$route.fullPath" />
    </keep-alive>
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
import NavItem from '@/components/NavItem.vue'
import { getUserFollow } from '@/api/buzz.ts'

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
    NavItem
    // Search
  },
  data() {
    return {
      showPub: location.host.includes('localhost'),
    };
  },
  setup() {
    return {
      ...useI18n(),
    }
  },
  computed: {
    ...mapState({
      user: 'user',
      accessToken: 'accessToken',
      isSDKLoaded: 'isSDKLoaded',
    }),
    hasToken() {
      return !!this.accessToken
    },
    currentRouteName() {
      return this.$route.name;
    },
    loadingStatus() {
      return this.$isMobile ? '' : 'MetaID框架...'
    },
    links() {
      return [
        {
          to: '/user',
          name: 'User',
          enable: this.hasToken || this.user.name
        },
        {
          to: '/pub/hot',
          name: 'PubList',
          enable: true
        },
        {
          to: '/search',
          name: 'Search',
          enable: true
        },
        {
          to: '/setting',
          name: 'Setting',
          enable: true
        },
        {
          to: 'https://bsv.oaker.bid/',
          name: 'bsv123',
          isExternal: true,
          img: 'https://bsv.oaker.bid/img/icons/favicon.png',
          enable: true
        }
      ]
    },
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
      if (this.$isInShowApp) return
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
      }).catch((e) => {
        window.localStorage.clear()
        window.location.href = '/'
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
      if (this.$isInShowApp) {
        console.log('before app get userinfo')
        window.__metaIdJs.getUserInfo(AppConfig.oauthSettings.clientId, AppConfig.oauthSettings.clientSecret, 'handleUserLoginData')
      } else {
        const userCache = Storage.getObj('user') || '{}'
        if (userCache.metaId) {
          this.$store.commit('SET_USER', userCache);
          this.getUserFollow(userCache.metaId)
        } else {
          window.__metaIdJs.getUserInfo({
            accessToken: this.accessToken, // app 内，需要吗？
            callback: this.handleUserLoginData,
          })
        }
      }
    },
    handleUserLoginData(res) {
      if (typeof res === 'string') {
        res = JSON.parse(res)
      }
      const { code, data, appAccessToken } = res
      // console.log('debug logindata: ', res.code, res.code === 200, res)
      if (code === 200) {
        this.$store.commit('SET_USER', data);
        console.log('userinfo: ', data)
        if (appAccessToken) {
          this.$store.commit('SET_ACCESS_TOKEN', appAccessToken)
          this.getUserFollow(data.metaId)
          console.log('设置 app token 成功')
        }
      } else {
        console.error('get user error: ', res)
      }
    },
    getUserFollow(metaId) {
      getUserFollow({metaId}).then(res => {
        const { code, data } = res
        if (code === 0) {
          this.$store.commit('SET_USER_FOLLOW', data)
        } else {
          console.log('get follow error', res)
        }
      }, (err) => console.log('fail: ', err))
    },
    async initSDK(hasUserInfo = false) {
      await SDKInit()
      console.log('sdk loaded')
      this.$store.commit('SET_SDK_LOADED', true);
      if (!hasUserInfo) {
        // console.log('this', this)
        this.getUser()
      }
    },
  },
  created() {
    window.handleUserLoginData = this.handleUserLoginData
    this.code = getUrlParameterByName('code')
    // 是否存在 token
    //  是否存在 user cache
    //    并行初始化 sdk
    //  sdk 是否初始化
    if (this.code) {
      // !this.hasToken && this.$route.path === '/user' &&
      this.$toast('请等待...')
      this.getAccessToken(this.code).then(() => {
        window.history.replaceState({},'', location.pathname)
        this.initSDK()
      })
    } else {
      const userCache = Storage.getObj('user') || '{}'
      if (userCache.metaId) {
        this.$store.commit('SET_USER', userCache);
        this.initSDK(false)
      } else {
        if (window.appMetaIdJs || (this.hasToken && this.$route.path === '/user')) {
          console.log('app inner init sdk')
          this.initSDK()
        }
      }
    }
  },
  mounted() {
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
    font-weight: bold;
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
  .link {
    margin-right: 6px;
    text-align: center;
    padding: 4px;
  }
  .custom-icon {
    width: 32px;
    height: 32px;
    padding: 4px;
    box-sizing: border-box;
    position: relative;
    top: 2px;
  }
}

.user {
  div:hover {
    cursor: pointer
  }
}

</style>
<style lang="scss">
:root {
  --theme-color: #c68230;
  --theme-deeper-color: #ab490d;
  /* --theme-deeper-color: #83380a; */
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  padding: 8px;
  max-width: 600px;
  margin: 0 auto;
  .van-pagination__item--active {
    background-color: var(--theme-color)!important;
  }
}
.btn-theme {
  color: white;
  background: var(--theme-color);
  border-color: var(--theme-color);
}
.btn-reverse {
  background: white;
  color: var(--theme-color);
  border-color: var(--theme-color);
}
</style>
