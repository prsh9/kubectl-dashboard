import Vue from 'vue'
import Vuex from 'vuex'
import pod_data from './modules/pod_data'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    pod_data,
  },
  strict: debug
})