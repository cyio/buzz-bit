import Vue from "vue";
import Vuex from "vuex";
import { Storage } from '@/utils/index';
import { getToken } from '@/api/buzz.ts';
import AppConfig from '@/config/'

Vue.use(Vuex);

const showVideoInFlowInitValue = localStorage.getItem('showVideoInFlow')
const needConfirmInitValue = localStorage.getItem('needConfirm')

export default new Vuex.Store({
  state: {
    user: {},
    accessToken: Storage.getItem('access_token') || '',
    refreshToken: Storage.getItem('refresh_token') || '',
    isSDKLoaded: false,
    showVideoInFlow: showVideoInFlowInitValue === 'false' ? false : true,
    needConfirm: needConfirmInitValue === 'false' ? false : true
  },
  actions: {
    async refreshAccessToken ({ commit, state }) {
      await getToken({
        'grant_type': 'refresh_token',
        'scope': 'app',
        'refresh_token': state.refreshToken,
        'client_id': AppConfig.oauthSettings.clientId,
        'client_secret': AppConfig.oauthSettings.clientSecret
      }).then(res => {
        if (res.access_token) {
          commit('SET_ACCESS_TOKEN', res.access_token)
          commit('SET_REFRESH_TOKEN', res.refresh_token)
        } else if (res.error_description) {
          window.localStorage.clear()
          console.log('get token error: ', res.error_description)
          // this.$toasted.error(res.error_description)
        }
      })
    }
  },
  mutations: {
    SET_USER(state, value) {
      state.user = value
      Storage.setItem('user', value)
    },
    SET_ACCESS_TOKEN(state, value) {
      state.accessToken = value
      Storage.setItem('access_token', value)
    },
    SET_REFRESH_TOKEN(state, value) {
      state.refreshToken = value
      Storage.setItem('refresh_token', value)
    },
    SET_SDK_LOADED(state, value) {
      state.isSDKLoaded = value
    },
    SET_SHOW_VIDEO_IN_FLOW(state, value) {
      state.showVideoInFlow = value
      Storage.setItem('showVideoInFlow', value)
    },
    SET_NEED_CONFIRM(state, value) {
      state.needConfirm = value
      Storage.setItem('needConfirm', value)
    },
    SET_USER_FOLLOW(state, value) {
      state.user.socialList = value
      // Storage.setItem('user', state.user)
    },
  },
  modules: {},
});
