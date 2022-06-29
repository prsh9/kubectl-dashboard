<template>
  <div id="k8_pod_parent">
    <v-card tile flat>
      <v-card-title class="pa-2">Pods in namespace '{{ selectedNamespace }}'</v-card-title>
    </v-card>
    <div id="pod_content" v-show="status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header.name" :style="header.style">{{ header.name }}</th>
          </tr>
        </thead>
        <tbody>
          <PodRow v-for="row in podItems" :key="row.metadata.uid" :row="row" :class="{ selected: selected ? selected.includes(row.metadata.uid) : false }" @selected="selectUid"></PodRow>
        </tbody>
      </v-simple-table>
    </div>
    <v-card v-if="!status" outlined class="flexcontainer flex-grow-1 justify-center">
      <v-card-text>{{ message }}</v-card-text>
    </v-card>
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
      selected: null,
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
          return this.$store.dispatch('k8Data/watchPodData');
        },
        (rej) => {
          console.log("Error" + rej);
        }
      ).finally(() => {
        this.startRefresher();
      });
    },
    startRefresher: function() {
      this.timeoutInstance = setTimeout(this.init, 60000);
    },
    selectUid: function(id) {
      this.selected = id
    }
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
.selected {
  background: lightgrey
}
</style>