<template>
  <div id="consolegroup" class="flexcontainer flex-grow-1">
    <v-card v-if="!consoles.length" outlined class="flexcontainer flex-grow-1 justify-center align-center">
      No Open/Created Consoles
    </v-card>
    <v-tabs fixed-tabs v-model="selectedTab" v-if="consoles.length" class="flexcontainer flex-grow-0 flex-shrink-1">
      <v-tab v-for="(item, index) in consoles" :key="item.podSpec.podUid">
        <v-spacer></v-spacer>
        {{ item.podSpec.podName }}
        <v-spacer></v-spacer>
        <v-btn class="text-right" icon outlined x-small @click="close(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="selectedTab" v-if="consoles.length" class="tabclass">
      <v-tab-item v-for="item in consoles" :key="item.podSpec.podUid" active-class="tabclass">
        <ConsoleWindow :podSpec="item.podSpec" :shellType="item.shellType"/>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import ConsoleWindow from "./ConsoleWindow.vue";
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('k8Data')

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
    close: function(item) {
      this.$store.dispatch("k8Data/deleteOpenConsole", item)
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

