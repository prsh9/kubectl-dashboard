<template>
  <div id="k8_svc_parent">
    <div id="svc_content" v-show="status">
      <v-simple-table fixed-header>
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
    <div id="err_content">
      <div v-show="!status">
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>
        
<script>
import SvcRow from './SvcRow.vue'
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('podData')

export default {
  data() {
    return {
      tableHeaders: ["NameSpace", "Name", "Type", "ClusterIP", "Ports", "Actions"],
      refresh: false
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      svcItems: 'orderedSvcItems'
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
      await this.$store.dispatch('podData/fetchSvcData')
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
    }
  },
  components: {
    SvcRow
  }
};
</script>
