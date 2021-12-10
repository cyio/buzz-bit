import Vue from "vue";
import Vuex from "vuex";
import { Storage } from '@/utils/index';

Vue.use(Vuex);

const showVideoInFlowInitValue = localStorage.getItem('showVideoInFlow')
const needConfirmInitValue = localStorage.getItem('needConfirm')

export default new Vuex.Store({
  state: {
    user: {},
    accessToken: Storage.getItem('access_token') || '',
    isSDKLoaded: false,
    showVideoInFlow: showVideoInFlowInitValue === 'false' ? false : true,
    needConfirm: needConfirmInitValue === 'false' ? false : true
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
  actions: {},
  modules: {},
});
