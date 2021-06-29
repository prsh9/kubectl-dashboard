<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" expand-on-hover clipped hide-overlay app permanent>
      <v-list nav dense>
        <v-list-item-group mandatory active-class="teal--text text--accent-4">
          <v-list-item v-for="item in menuItems" :key="item.title" :to="item.link">
            <v-list-item-icon>
              <v-icon>mdi-{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app clipped-left color="teal lighten-1" class="text--lighten-5">
      <v-toolbar-title>Kube Dev Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-app-bar-nav-icon color="lighten-5" @click="aboutScreen = true"><v-icon>mdi-information-outline</v-icon></v-app-bar-nav-icon>
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
import Home from "./components/Home.vue";
import Setting from "./components/Setting.vue";
import ConsoleGroups from './components/ConsoleGroups.vue'
import LogGroups from './components/LogGroups.vue';
import About from './components/About.vue';

import VueRouter from "vue-router";

const router = new VueRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/setting", component: Setting },
    { path: "/log", component: LogGroups },
    { path: "/console", component: ConsoleGroups },
  ]
});

export default {
  name: "App",
  router,
  data() {
    return {
      drawer: null,
      aboutScreen: false,
      menuItems: [
        { icon: "home", title: "Home", link: "/" },
        { icon: "math-log", title: "Log Group", link: "/log" },
        { icon: "console", title: "Console Group", link: "/console" },
      ]
    };
  },
  components: {
    About
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
</style>
