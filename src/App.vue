<template>
  <div id="app">
    <div class="site-nav" v-if="!embed">
      <div class="left">
        <span class="title" @click="goHome">BuzzBit</span>
        <span class="ver">{{$version}}</span>
        <van-loading v-show="!isSendPage && hasToken && !isSDKLoaded" size="16px" class="sdk-loading"
        >{{loadingStatus}}</van-loading>
      </div>
      <div class="links">
        <div class="link" v-for="item of filterNavItem(links)" :key="item.name">
          <template>
            <div v-if="item.isExternal">
                <a :href="item.to" target="_blank">
                  <img class="custom-icon" :src="item.img" />
                </a>
            </div>
            <div v-else-if="item.isInternel" @click="$router.push({ path: item.to })">
              <img class="custom-icon" :src="item.img" />
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
          <!-- <van-button @click="auth" v-else color="var(--theme-color)" size="small">{{t('btn.login')}}</van-button> -->
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
import { defineComponent } from 'vue'
import { goAuth, getToken, getOwnShowAccount, getProtocolDataList } from '@/api/buzz.ts'
import { getUrlParameterByName } from '@/utils/index';
import AppConfig from '@/config/'
import { mapState, mapActions } from 'vuex'
import { Dialog } from 'vant';
import { Storage } from '@/utils/index';
import newNodePathUtils from '@/utils/node-path';
import SDKInit from '@/utils/sdk';
import { useI18n } from 'vue-i18n-composable'
import NavItem from '@/components/NavItem.vue'
import { getUserFollow } from '@/api/buzz.ts'
import sensiletIcon from '@/assets/icons/sensilet.png'

let tId = null
export default defineComponent({
  name: "App",
  props: {
  },
  components: {
    NavItem,
  },
  data() {
    return {
      showPub: location.host.includes('localhost'),
      path: '',
      embed: false,
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
      refreshToken: 'refreshToken',
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
    isSendPage() {
      return this.path === '/send'
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
          to: '/send',
          name: 'Send',
          isInternel: true,
          img: sensiletIcon,
          enable: !!window.sensilet
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
    ...mapActions({
      refreshAccessToken: 'refreshAccessToken'
    }),
    filterNavItem(arr) {
      return arr.filter(i => i.enable)
    },
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
        'redirect_uri': AppConfig.oauthSettings.redirectUri,
        'scope': 'app',
        'client_id': AppConfig.oauthSettings.clientId,
        'client_secret': AppConfig.oauthSettings.clientSecret
      }).then(res => {
        if (res.access_token) {
          this.$store.commit('SET_ACCESS_TOKEN', res.access_token)
          this.$store.commit('SET_REFRESH_TOKEN', res.refresh_token)
        } else if (res.error_description) {
          this.$toast(res.error_description)
        }
      }).catch((e) => {
        window.localStorage.clear()
        window.location.href = '/'
      })
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
        window.__metaIdJs.getUserInfo_({
          accessToken: this.accessToken,
          callback: this.handleUserLoginData,
        })
      } else {
        const userCache = Storage.getObj('user') || '{}'
        if (userCache.metaId) {
          this.$store.commit('SET_USER', userCache);
          this.getUserFollow(userCache.metaId)
        } else {
          window.__metaIdJs.getUserInfo_({
            accessToken: this.accessToken,
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
        this.getBuzzParentTxId()
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
    async getBuzzParentTxId() {
      const res = await getOwnShowAccount({
        data: JSON.stringify({
          showId: this.user.metaId
        })
      })
      if (res.msg === 'success') {
        const { xpub, protocolTxId } = res.result
        console.log('ShowAccount 1', xpub, protocolTxId)
        const resp = await getProtocolDataList({
          data: JSON.stringify({
            protocolTxId,
            nodeName: 'SimpleMicroblog'
          })
        })
        if (resp.msg === 'success') {
          const parentTxId = resp.result.data[0].txId
          // window.$ShowAccount.buzzParentTxId = parentTxId
          newNodePathUtils.init({
            xpub,
            parentTxId
          })
          console.log('ShowAccount ready!')
          // this.$store.commit('SET_SDK_LOADED', true); // 折中处理，允许用户尽早发帖
        }
      }
    },
    async initSDK(hasUserInfo = false) {
      console.log('init sdk', this.path)
      if (this.isSendPage) {
        return
      }
      // await SDKInit()
      console.log('sdk loaded')
      this.$store.commit('SET_SDK_LOADED', true);
      if (this.$isInShowApp || !hasUserInfo) {
        this.getUser()
      }
    },
  },
  created() {
    const querys = new URLSearchParams(window.location.search)
    this.embed = querys.get('embed') === '1'

    window.handleUserLoginData = this.handleUserLoginData
    this.code = getUrlParameterByName('code')
    this.path = location.pathname
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
      if (this.accessToken && this.refreshToken) {
        this.refreshAccessToken()
      }
      const userCache = Storage.getObj('user') || '{}'
      if (userCache.metaId) {
        this.$store.commit('SET_USER', userCache);
        this.initSDK(true)
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
    cursor: pointer;
  }
}

.user {
  margin-left: 10px;
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


.site-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 25px auto;
  max-width: 600px;
  color: var(--theme-color);
}
</style>
