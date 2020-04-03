<template>
  <div>
    <v-tabs fixed-tabs v-model="tab">
      <v-tab>Pod Info</v-tab>
      <v-tab v-for="(item, index) in logtabs" :key="item.index">
        <v-spacer></v-spacer>
        {{ item.title }}
        <v-spacer></v-spacer>
        <v-btn class="text-right" icon outlined x-small @click="close(index)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <DisplayPodData @view_log="onViewLog" />
      </v-tab-item>
      <v-tab-item v-for="item in logtabs" :key="item.index">
        <ShowLog :podNamespace="item.podNamespace" :podName="item.podName" />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import DisplayPodData from "./DisplayPodData.vue";
import ShowLog from "./ShowLog.vue";

export default {
  name: "Home",
  data() {
    return {
      tab: null,
      logtabs: [],
      index: 1
    };
  },
  created() {
    this.index = 1;
  },
  methods: {
    onViewLog: function(podNamespace, podName) {
      this.logtabs.push({
        index: this.index,
        title: podName + " Logs",
        podNamespace: podNamespace,
        podName: podName
      });
      this.index++;
      this.tab = this.logtabs.length;
    },
    close: function(item) {
      this.logtabs.splice(item, 1);
    }
  },
  components: {
    DisplayPodData,
    ShowLog
  }
};
</script>
