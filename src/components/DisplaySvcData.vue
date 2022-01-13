<template>
  <div id="k8_svc_parent">
    <v-card tile flat>
      <v-card-title class="pa-2">Services in namespace '{{ selectedNamespace }}'</v-card-title>
    </v-card>
    <div id="svc_content" v-show="status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <SvcRow v-for="row in svcItems" :key="row.metadata.uid" :row="row"></SvcRow>
        </tbody>
      </v-simple-table>
    </div>
    <v-card v-if="!status" outlined class="flexcontainer flex-grow-1 justify-center">
      <v-card-text>{{ message }}</v-card-text>
    </v-card>
  </div>
</template>
        
<script>
import SvcRow from './SvcRow.vue'
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  data() {
    return {
      tableHeaders: ["Name", "Type", "ClusterIP", "Ports", "Actions"],
      refresh: false,
      timerInterval: null,
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      svcItems: 'orderedSvcItems',
      selectedNamespace: 'getSelectedNamespace'
    }),
  },
  activated() {
    this.init()
  },
  deactivated() {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  },
  beforeDestroy() {
    clearInterval(this.timerInterval)
    this.timerInterval = null;
  },
  methods: {
    init: async function() {
      await this.$store.dispatch('k8Data/stopSvcWatch').then(() => {
        return this.$store.dispatch('k8Data/fetchSvcData')
        }).then(() => {
          return this.$store.dispatch('k8Data/watchSvcData');
        },
        (rej) => {
          console.log("Error" + rej);
        }
      ).finally(() => {
        this.startRefresher();
      });
    },
    startRefresher: function() {
      this.timerInterval = setTimeout(this.init, 10000);
    },
  },
  components: {
    SvcRow
  }
};
</script>
