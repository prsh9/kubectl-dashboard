<template>
  <div id="k8_pod_parent">
    <div id="pod_content" v-show="status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <PodRow v-for="row in podItems" :key="row.metadata.uid" :row="row" v-on:view-log="onViewLog"></PodRow>
        </tbody>
      </v-simple-table>
    </div>
    <div id="pod_err_content">
      <div v-show="!status">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>
        
<script>
import PodRow from "./PodRow.vue";
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('podData')

export default {
  data() {
    return {
      tableHeaders: ["NameSpace", "Name", "Containers", "Status", "Pod IP", "Actions"],
      refresh: false
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      podItems: 'orderedPodItems'
    }),
  },
  created() {
    this.init();
  },
  mounted() {
    this.startRefresher();
    this.refresh = true;
  },
  beforeDestroy() {
    this.refresh = false;
  },
  methods: {
    init: async function() {
      // console.log("Start init")
      await this.$store.dispatch('podData/stopPodWatch').then(() => {
        return this.$store.dispatch('podData/fetchPodData')
        }).then(() => {
          return this.$store.dispatch('podData/watchPodData');
        },
        (rej) => {
          console.log("Error" + rej);
        }
      );
      // console.log("Finish init")
    },
    startRefresher: function() {
      setTimeout(this.performRefresh, 10000);
    },
    performRefresh: function() {
      // console.log("Start Refresh")
      this.init().then(() => {
        if(this.refresh) {
          // console.log("Restarting Refresh")
          this.startRefresher();
        }
      });
      // console.log("Finish Refresh")
    },
    onViewLog: function(podNamespace, podName) {
      console.log("On View Logs for " + podNamespace + "." + podName);
      this.$emit('view-log', podNamespace, podName);
    }
  },
  components: {
    PodRow
  }
};
</script>
