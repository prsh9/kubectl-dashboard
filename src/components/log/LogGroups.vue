<template>
  <div id="loggroup" class="flexcontainer flex-grow-1">
    <v-card v-if="!logs.length" outlined class="flexcontainer flex-grow-1 justify-center align-center">
      No Opened Logs
    </v-card>
    <v-tabs fixed-tabs v-model="selectedTab" v-if="logs.length" class="flexcontainer flex-grow-0 flex-shrink-1">
      <v-tab v-for="(item, index) in logs" :key="item.id">
        <v-spacer></v-spacer>
        {{ item.data.podName }} Logs
        <v-spacer></v-spacer>
        <v-btn class="text-right" icon outlined x-small @click="close(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="selectedTab" v-if="logs.length" class="tabclass">
      <v-tab-item v-for="item in logs" :key="item.id" active-class="tabclass">
        <LogViewer :logDetails="item.data"/>
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import LogViewer from "../log/LogViewer.vue";
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('openLogs')

export default {
  name: "LogGroups",
  props: [''],
  data() {
    return {
      selectedTab: 0
    };
  },
  computed: {
    ...mapGetters({
      logs: 'getOpenTabs',
    }),
  },
  activated() {
    if(this.$route.query && this.$route.query.select) {
      var select = this.$route.query.select;
      if(select == -1) {
        select = this.logs.length - 1
      }
      this.selectedTab = select
    }
  },
  methods: {
    close: function(itemIndex) {
      this.$store.dispatch("openLogs/removeOpenTabByIndex", itemIndex)
    }
  },
  components: {
    LogViewer
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

