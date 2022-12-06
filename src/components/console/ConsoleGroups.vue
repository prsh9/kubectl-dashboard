<template>
  <div id="consolegroup" class="flexcontainer flex-grow-1">
    <v-card v-if="!consoles.length" outlined class="flexcontainer flex-grow-1 justify-center align-center">
      No Open/Created Consoles
    </v-card>
    <v-tabs fixed-tabs v-model="selectedTab" v-if="consoles.length" class="flexcontainer flex-grow-0 flex-shrink-1">
      <v-tab v-for="(item, index) in consoles" :key="item.id">
        <v-spacer></v-spacer>
        {{ item.data.podName }}
        <v-spacer></v-spacer>
        <v-btn class="text-right" icon outlined x-small @click="close(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="selectedTab" v-if="consoles.length" class="tabclass">
      <v-tab-item v-for="item in consoles" :key="item.id" active-class="tabclass">
        <ConsoleWindow :consoleSpec="item.data"/>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import ConsoleWindow from "./ConsoleWindow.vue";
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('openConsoles')

export default {
  name: "ConsoleGroups",
  data() {
    return {
      selectedTab: 0
    };
  },
  computed: {
    ...mapGetters({
      consoles: 'getOpenTabs',
    }),
  },
  activated() {
    if(this.$route.query && this.$route.query.select) {
      var select = this.$route.query.select;
      if(select == -1) {
        select = this.consoles.length - 1
      }
      this.selectedTab = select
    }
  },
  methods: {
    close: function(itemIndex) {
      this.$store.dispatch("openConsoles/removeOpenTabByIndex", itemIndex)
    }
  },
  components: {
    ConsoleWindow
  },
};
</script>

<style>
  .flexcontainer {
    display: flex;
    flex-direction: column;
  }
  .tabclass {
    display: flex;
    flex-grow: 1;
  }
  .tabclass > .v-window__container {
    display: flex;
    flex-grow: 1;
  }
</style>

