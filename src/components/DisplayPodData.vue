<template>
  <div id="k8_pod_parent">
    <div><h3>Pods in namespace {{ selectedNamespace }}</h3>
    </div>
    <div id="pod_content" v-show="status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <PodRow v-for="row in podItems" :key="row.metadata.uid" :row="row"></PodRow>
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

const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  data() {
    return {
      tableHeaders: ["Name", "Containers", "Status", "Pod IP", "Age", "Actions"],
      refresh: false,
      timeoutInstance: null
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      podItems: 'orderedPodItems',
      selectedNamespace: 'getSelectedNamespace'
    }),
  },
  created() {
    this.init();
  },
  mounted() {
    this.startRefresher();
    this.refresh = true;
  },
  activated() {
    this.startRefresher()
    console.log("pod activated")
  },
  deactivated() {
    clearInterval(this.timeoutInstance)
    console.log("pod deactivated")
  },
  beforeDestroy() {
    clearInterval(this.timeoutInstance)
    console.log("pod destroyed")
  },
  methods: {
    init: async function() {
      // console.log("Start init")
      await this.$store.dispatch('k8Data/stopPodWatch').then(() => {
        return this.$store.dispatch('k8Data/fetchPodData')
        }).then(() => {
          return this.$store.dispatch('k8Data/watchPodData');
        },
        (rej) => {
          console.log("Error" + rej);
        }
      );
      // console.log("Finish init")
    },
    startRefresher: function() {
      this.timeoutInstance = setTimeout(this.performRefresh, 10000);
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
  },
  components: {
    PodRow
  }
};
</script>
