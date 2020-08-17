<template>
  <v-app>
    <v-navigation-drawer v-model="drawer" expand-on-hover clipped app permanent>
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

    <v-app-bar app clipped-left color="teal lighten-1">
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
      <v-toolbar-title>Kube Dev Dashboard</v-toolbar-title>
    </v-app-bar>
    
    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container>
        <router-view></router-view>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import Home from "./components/Home.vue";
import Setting from "./components/Setting.vue";

import VueRouter from "vue-router";
const router = new VueRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/setting", component: Setting }
  ]
});

export default {
  name: "App",
  router,
  data() {
    return {
      drawer: null,
      menuItems: [
        { icon: "home", title: "Home", link: "/" },
        { icon: "settings", title: "Settings", link: "/setting" }
      ]
    };
  }
};
</script>

