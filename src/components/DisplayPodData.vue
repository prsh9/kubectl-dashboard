<template>
  <div id="k8table_parent">
    <div id="table_content" v-show="status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <PodRow v-for="row in podItems" :key="row.metadata.uid" :row="row" v-on:view_log="onViewLog"></PodRow>
        </tbody>
      </v-simple-table>
    </div>
    <div id="err_content">
      <div v-show="!status">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>
        
<script>
import PodRow from "./PodRow.vue";
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      tableHeaders: ["NameSpace", "Name", "Containers", "Status", "Pod IP", "Actions"],
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
  },
  methods: {
    init: async function() {
      // console.log("Start init")
      await this.$store.dispatch('stopPodWatch').then(() => {
        return this.$store.dispatch('fetchPodData')}).then(() => {
          return this.$store.dispatch('watchPodData');
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
        // console.log("Restarting Refresh")
        this.startRefresher();
      });
      // console.log("Finish Refresh")
    },
    onViewLog: function(podNamespace, podName) {
      console.log("On View Logs for " + podNamespace + "." + podName);
      this.$emit('view_log', podNamespace, podName);
    }
  },
  components: {
    PodRow
  }
};
</script>
