<template>
  <div>
    <v-card v-if="!consoles.length">
      No Open/Created Consoles
    </v-card>
    <v-tabs fixed-tabs v-model="selectedTab">
      <v-tab v-for="(item, index) in consoles" :key="item.podSpec.podUid">
        <v-spacer></v-spacer>
        {{ item.podSpec.podName }}
        <v-spacer></v-spacer>
        <v-btn class="text-right" icon outlined x-small @click="close(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="selectedTab">
      <v-tab-item v-for="item in consoles" :key="item.podUid">
        <Console :podSpec="item.podSpec" :shellType="item.shellType" />
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

