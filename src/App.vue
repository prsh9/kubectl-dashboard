<template>
  <v-app>
    <NavDrawer></NavDrawer>

    <v-app-bar app clipped-left color="teal lighten-1" class="text--lighten-5">
      <v-toolbar-title>Kube Dev Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon color="lighten-5" @click="aboutScreen = true">
        <v-badge bottom dot overlap color="yellow" :value="updateInfo.updateAvailable">
          <v-icon>mdi-information-outline</v-icon>
        </v-badge>
      </v-app-bar-nav-icon>
      <VDropdown :offset="[-15, -10]">
        <v-app-bar-nav-icon>
          <!-- This will be the popover reference (for the events and position) -->
          <v-icon class="indicator rounded-circle" :class="{ blink: loading }" :style="{ background: determineColor }" small dense></v-icon>
        </v-app-bar-nav-icon>
        <!-- This will be the content of the popover -->
          <template #popper>
            <v-card tile outlined>
              <v-card-text class="low-padding">{{ message }}</v-card-text>
            </v-card>
          </template>
      </VDropdown>
    </v-app-bar>
    
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid class="main-container">
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
        <v-dialog v-model="aboutScreen" persistent max-width="480px">
          <About
            v-if="aboutScreen"
            @close="aboutScreen = false">
          </About>
        </v-dialog>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>

import { checkForUpdates, getCurrentVersion } from './js/helpers';

import NavDrawer from "./components/main/NavDrawer.vue"
import DisplayNamespace from "./components/DisplayNamespace.vue"
import DisplayPodData from "./components/DisplayPodData.vue"
import DisplaySvcData from "./components/DisplaySvcData.vue"
import Setting from "./components/main/Setting.vue";
import ConsoleGroups from './components/console/ConsoleGroups.vue'
import LogGroups from './components/log/LogGroups.vue';
import About from './components/main/About.vue';

import ElectronStore from 'electron-store'
const store = new ElectronStore();

import VueRouter from "vue-router";

const router = new VueRouter({
  routes: [
    { path: "/namespace", component: DisplayNamespace },
    { path: "/pod", component: DisplayPodData },
    { path: "/svc", component: DisplaySvcData },
    { path: "/setting", component: Setting },
    { path: "/log", component: LogGroups },
    { path: "/console", component: ConsoleGroups },
    { path: "/", redirect: "/pod" },
  ]
});

import { createNamespacedHelpers } from 'vuex'
const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  name: "App",
  router,
  data() {
    return {
      drawer: null,
      aboutScreen: false,
      updateInfo: {
        updateAvailable: false,
      },
    };
  },
  computed: {
    determineColor: function() {
      var color = "radial-gradient(circle at 50% 50%, #eb321a, #eb321a, #ffffff)"
      if(this.status) {
        color = "radial-gradient(circle at 50% 50%, #1cf700, #49eb34, #ffffff)"
      }
      if(!this.status && this.loading) {
        color = "radial-gradient(circle at 50% 50%, #e6df05, #e6df05, #ffffff)"
      }
      return color;
    },
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      loading: 'getLoading'
    })

  },
  created() {
    this.updateChecker()
  },
  methods: {
    updateChecker: function() {
      var updateAvailableConfig = store.get("update.updateAvailable", false)
      this.updateInfo.updateAvailable = updateAvailableConfig;

      var currentVersion = getCurrentVersion()
      currentVersion = "v" + currentVersion
      var latestVersionConfig = store.get("update.latestVersion", currentVersion)
      
      if(currentVersion == latestVersionConfig) {
        this.updateInfo.updateAvailable = false;
        store.set("update.updateAvailable", false)
      }

      var lastCheckedConfig = store.get("update.lastChecked", 0)
      console.log("Update last checked " + lastCheckedConfig)
      var lastChecked = new Date(lastCheckedConfig)
      lastChecked.setDate(lastChecked.getDate() + 1)
      
      var nowTime = Date.now()
      if(lastChecked < nowTime) {
        console.log("****** Checking for updates")
        var vm = this;
        checkForUpdates().then((res) => {
          vm.updateInfo.updateAvailable = res.is_upgrade
          store.set("update.lastChecked", nowTime)
          store.set("update.updateAvailable", res.is_upgrade)
          store.set("update.latestVersion", res.latest_version)
        }, (err) => {
          console.log("Error Checking for updates : " + err)
        })
      }
    }
  },
  components: {
    About,
    NavDrawer
  }
};
</script>

<style>
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    height: 100%;
    min-height: 200px;
  }
  .indicator {
    background-clip: content-box;
    height: 10px !important;
    width: 10px !important;
    box-shadow: 0px 0px 15px 1px white;
  }
  .low-padding {
    padding: 4px;
  }

  @keyframes blink {
    50% {
      opacity: 0.0;
    }
  }
  .blink {
    animation: blink 1s step-start 0s infinite;
  }
</style>
