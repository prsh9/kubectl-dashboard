<template>
  <div>
    Console Groups
    <v-tabs fixed-tabs v-model="selectedTab">
      <v-tab v-for="(item, index) in consoles" :key="item.podUid">
        <v-spacer></v-spacer>
        {{ item.podName }}
        <v-spacer></v-spacer>
        <v-btn class="text-right" icon outlined x-small @click="close(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="selectedTab">
      <v-tab-item v-for="item in consoles" :key="item.podUid">
        <Console :podSpec="item" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import Console from "./Console.vue";
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('podData')

export default {
  name: "ConsoleGroups",
  props: [''],
  data() {
    return {
      selectedTab: 0
    };
  },
  computed: {
    ...mapGetters({
      consoles: 'getOpenConsoles',
    }),
  },
  methods: {
    close: function(item) {
      this.$store.dispatch("podData/deleteOpenConsole", item)
    }
  },
  components: {
    Console
  },
};
</script>

