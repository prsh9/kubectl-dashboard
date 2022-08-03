import Vue from 'vue'
import Vuex from 'vuex'
import k8_data from './modules/k8_data'
import tab_data from './modules/tab_data'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    k8Data: {
      namespaced: true,
      ...k8_data
    },
    openConsoles: {
      namespaced: true,
      ...tab_data
    },
    openLogs: {
      namespaced: true,
      ...tab_data
    },
  },
  strict: debug
})