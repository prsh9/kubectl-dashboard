import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import 'roboto-fontface/css/roboto/roboto-fontface.css'
import '@mdi/font/css/materialdesignicons.css'

Vue.config.productionTip = false
Vue.use(VueRouter);

var sourceOfTruth = {
  message: "Hello"
}

new Vue({
  vuetify,
  render: function (h) { return h(App) },
  data: sourceOfTruth
}).$mount('#app')
