import Vue from "vue";
import Vuex from "vuex";
import { Storage } from '@/utils/index';

Vue.use(Vuex);

const showVideoInFlowInitValue = localStorage.getItem('showVideoInFlow')

export default new Vuex.Store({
  state: {
    user: {},
    accessToken: Storage.getItem('access_token') || '',
    showVideoInFlow: showVideoInFlowInitValue === 'false' ? false : true
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
    SET_SHOW_VIDEO_IN_FLOW(state, value) {
      state.showVideoInFlow = value
      Storage.setItem('showVideoInFlow', value)
    },
  },
  actions: {},
  modules: {},
});
