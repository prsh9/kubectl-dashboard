<template>
    <v-navigation-drawer v-model="drawer" :mini-variant=mini clipped app hide-overlay permanent>
      <v-list nav dense>
        <v-list-item-group active-class="teal--text text--accent-4">
          <v-list-item v-for="item in menuItems" :key="item.title" :to="item.link">
            <v-list-item-icon>
              <v-icon>mdi-{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <template v-slot:append>
        <v-list nav flat dense>
          <v-list-item-group>
            <v-list-item to="/setting">
              <v-list-item-icon>
                <v-icon>mdi-cog</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item @click="mini = !mini">
              <v-list-item-icon>
                <v-icon>mdi-chevron-double-{{ mini ? 'right' : 'left' }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>Collapse</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </template>
    </v-navigation-drawer>
</template>

<script>

export default {
  name: "NavDrawer",
  data() {
    return {
      drawer: null,
      mini: true,
      menuItems: [
        { icon: "vector-arrange-below", title: "Namespaces", link: "/namespace" },
        { icon: "hexagon-multiple", title: "Deployments", link: "/deployment" },
        { icon: "cube-outline", title: "Pods", link: "/pod" },
        { icon: "cogs", title: "Services", link: "/svc" },
        { icon: "math-log", title: "Log Group", link: "/log" },
        { icon: "console", title: "Console Group", link: "/console" },
      ]
    };
  }
};
</script>
