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

const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  data() {
    return {
      tableHeaders: ["NameSpace", "Name", "Type", "ClusterIP", "Ports", "Actions"],
      refresh: false,
      timerInterval: null,
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
  activated() {
    this.startRefresher()
  },
  deactivated() {
    clearInterval(this.timeoutInstance)
  },
  beforeDestroy() {
    this.refresh = false;
    clearInterval(this.timeoutInstance)
  },
  methods: {
    init: async function() {
      // console.log("Start init")
      await this.$store.dispatch('k8Data/stopSvcWatch').then(() => {
        return this.$store.dispatch('k8Data/fetchSvcData')
        }).then(() => {
          return this.$store.dispatch('k8Data/watchSvcData');
        },
        (rej) => {
          console.log("Error" + rej);
        }
      );
      // console.log("Finish init")
    },
    startRefresher: function() {
      this.timerInterval = setTimeout(this.performRefresh, 10000);
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
