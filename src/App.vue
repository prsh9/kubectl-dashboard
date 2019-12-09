<template>
  <v-app>
    <v-app-bar app hide-on-scroll color="teal darken-2">
      <TitleBar />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container>
        <v-tabs fixed-tabs v-model="tab">
          <v-tab>Pod Info</v-tab>
          <v-tab v-for="(item, index) in logtabs" :key="item.index"><v-spacer></v-spacer>{{item.title}}<v-spacer></v-spacer><v-btn class="text-right" icon outlined x-small @click="close(index)"><v-icon>mdi-close</v-icon></v-btn></v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <DisplayPodData @view_log="onViewLog" />
          </v-tab-item>
          <v-tab-item v-for="item in logtabs" :key="item.index">
            <ShowLog :podNamespace="item.podNamespace" :podName="item.podName" />
          </v-tab-item>
        </v-tabs-items>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import TitleBar from "./components/TitleBar.vue";
import DisplayPodData from "./components/DisplayPodData.vue";
import ShowLog from "./components/ShowLog.vue";

export default {
  name: "App",
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
      this.logtabs.push({index: this.index, title: podName + " Logs", podNamespace: podNamespace, podName: podName});
      this.index++;
      this.tab = this.logtabs.length;
    },
    close: function(item) {
      // console.log("Closed Clicked for : " + this.logtabs[item].title);
      this.logtabs.splice(item, 1);
    }
  },
  components: {
    TitleBar,
    DisplayPodData,
    ShowLog
  }
};
</script>

