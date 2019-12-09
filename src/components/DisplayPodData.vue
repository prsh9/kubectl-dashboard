<template>
  <div id="k8table_parent">
    <div id="table_content" v-show="pod_data.status">
      <v-simple-table dense fixed-header>
        <thead>
          <tr>
            <th class="row-head-centered" v-for="header in tableHeaders" :key="header">{{header}}</th>
          </tr>
        </thead>
        <tbody>
          <PodRow v-for="row in orderedPodItems" :key="row.metadata.uid" :row="row" v-on:delete_pod="onDeletePod" v-on:view_log="onViewLog"></PodRow>
        </tbody>
      </v-simple-table>
    </div>
    <div id="err_content">
      <div v-show="!pod_data.status">
        <p>{{pod_data.message}}</p>
      </div>
    </div>
  </div>
</template>
        
<script>
import PodRow from "./PodRow.vue";

const kubeclient = require("kubernetes-client");
const JSONStream = require("JSONStream");

const client = new kubeclient.Client1_13();
var stream = null;

const myCommonFunctions = {
  getKey: function(podItem) {
    return (
      podItem.metadata.namespace +
      "." +
      podItem.metadata.name +
      "." +
      podItem.metadata.uid
    );
  }
};

export default {
  data() {
    return {
      tableHeaders: ["NameSpace", "Name", "Ready", "Status", "Pod IP", "Actions"],
      pod_data: {
        status: false,
        message: "Loading",
        data: {
          items: {}
        }
      }
    };
  },
  computed: {
    orderedPodItems: function() {
      var sorted = [];
      if (this.pod_data.status) {
        var podKeys = Object.keys(this.pod_data.data.items);
        podKeys.sort().forEach(elem => {
          sorted.push(this.pod_data.data.items[elem]);
        });
      }
      return sorted;
    }
  },
  created() {
    this.init();
  },
  mounted() {
    this.startRefresher();
  },
  methods: {
    init: async function() {
      await this.stopWatch();
      await this.getPodData();
    },
    getPodData: async function() {
      var vm = this;
      client.api.v1.pods.get().then(
        res => {
          vm.pod_data.status = true;
          vm.pod_data.message = "Success";
          vm.pod_data.data.metadata = res.body.metadata;
          var rv = res.body.metadata.resourceVersion;
          for (var item in res.body.items) {
            var itemdata = res.body.items[item];
            var objKey = myCommonFunctions.getKey(itemdata);
            vm.$set(vm.pod_data.data.items, objKey, itemdata);
          }

          this.startWatch(rv);
        },
        err => {
          console.log("Error (getPodData) " + err);
          vm.pod_data.status = false;
          vm.pod_data.message = err;
          vm.pod_data.data = {
            items: {}
          };
        }
      );
    },
    stopWatch: async function() {
      if (stream) {
        stream.abort();
        stream = null;
      }
    },
    startWatch: async function(rv) {
      stream = await client.api.v1.pods.getStream({
        qs: {
          resourceVersion: rv,
          watch: 1
        }
      });

      var jsonStream = JSONStream.parse();
      stream.pipe(jsonStream);

      var vm = this;
      jsonStream.on("data", async res => {
        var podKey = "";
        var pod_item = res.object;
        if (res.type === "ADDED") {
          // eslint-disable-next-line
          pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(
            res.object
          );
          podKey = myCommonFunctions.getKey(pod_item);
          vm.$set(this.pod_data.data.items, podKey, pod_item);
          console.log(
            "new object : " +
              pod_item.metadata.name +
              " : " +
              pod_item.metadata.uid
          );
        } else if (res.type === "MODIFIED") {
          // eslint-disable-next-line
          pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(
            res.object
          );
          podKey = myCommonFunctions.getKey(pod_item);
          vm.$set(this.pod_data.data.items, podKey, pod_item);
          console.log(
            "changed object : " +
              pod_item.metadata.name +
              " : " +
              pod_item.metadata.uid
          );
        } else if (res.type === "DELETED") {
          // eslint-disable-next-line
          pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(
            res.object
          );
          podKey = myCommonFunctions.getKey(pod_item);
          vm.$delete(this.pod_data.data.items, podKey);
          console.log(
            "deleted object : " +
              pod_item.metadata.name +
              " : " +
              pod_item.metadata.uid
          );
        } else {
          console.error("unknown type: " + JSON.stringify(res));
        }
        vm.$forceUpdate();
      });
    },
    startRefresher: function() {
      setTimeout(this.performRefresh, 7000);
    },
    performRefresh: function() {
      this.init().then(() => {
        this.startRefresher();
      });
    },
    onDeletePod: function(podNamespace, podName) {
      client.api.v1.namespaces(podNamespace).pods(podName).delete();
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
