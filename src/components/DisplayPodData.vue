<template>
  <div id="k8_pod_parent">
    <div>
      <h3>Pods in namespace '{{ selectedNamespace }}'</h3>
    </div>
    <div id="pod_content" v-show="status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header.name" :style="header.style">{{ header.name }}</th>
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
      tableHeaders: [ 
          { name: "Name" }, 
          { name: "Containers" }, 
          { name: "Status", style: "text-align: center" }, 
          { name: "Pod IP" }, 
          { name: "Age" }, 
          { name: "Actions" }
      ],
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
  activated() {
    this.init();
  },
  deactivated() {
    clearInterval(this.timeoutInstance)
    this.timeoutInstance = null;
  },
  beforeDestroy() {
    clearInterval(this.timeoutInstance)
    this.timeoutInstance = null;
  },
  methods: {
    init: async function() {
      await this.$store.dispatch('k8Data/stopPodWatch').then(() => {
          return this.$store.dispatch('k8Data/fetchPodData')
        }).then(() => {
          this.startRefresher();
          return this.$store.dispatch('k8Data/watchPodData');
        },
        (rej) => {
          console.log("Error" + rej);
        }
      );
    },
    startRefresher: function() {
      this.timeoutInstance = setTimeout(this.performRefresh, 60000);
    },
    performRefresh: function() {
      this.init().then(() => {
        this.startRefresher();
      });
    },
  },
  components: {
    PodRow
  }
};
</script>

<style>
.row-head-centered {
  text-align: center;
}
</style>