<template>
  <v-app>
    <v-app-bar app hide-on-scroll color="teal darken-2">
      <TitleBar />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container>
        <v-tabs grow v-model="tab">
          <v-tab>Pod Info</v-tab>
          <v-tab v-for="item in logtabs" :key="item.index">{{item.title}}</v-tab>
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
      logtabs: []
    };
  },
  methods: {
    onViewLog: function(podNamespace, podName) {
      console.log("Check Reached Here : " + podNamespace + "." + podName);
      this.logtabs.push({index: this.logtabs.length, title: podName + " Logs", podNamespace: podNamespace, podName: podName});
    }
  },
  components: {
    TitleBar,
    DisplayPodData,
    ShowLog
  }
};
</script>

