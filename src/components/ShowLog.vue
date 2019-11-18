<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>
          Logs for <b class="text-capitalize">{{ podNamespace }} - {{ podName }}</b>
        </h3>
        <v-layout row class="fab-horizontal">
          <v-btn color="cyan" depressed fab x-small class="btn-margin" @click="wrap = !wrap">
            <v-icon>{{wrap ? 'mdi-format-text-wrapping-wrap' : 'mdi-format-text-wrapping-overflow'}}</v-icon>
          </v-btn>
          <v-btn color="cyan" depressed fab x-small class="btn-margin">
            <v-icon>mdi-format-vertical-align-bottom</v-icon>
          </v-btn>
        </v-layout>
      </v-card-title>
      <v-card class="overflow-y-auto" max-height="75vh" flat outlined>
        <v-card-text>
          <pre v-if="!connected">{{errMessage}}</pre>
          <pre v-else :class="[wrap ? 'my-text-wrap' : 'my-text-no-wrap']" v-for="(text, index) in logdata" :key="index">{{text}}</pre>
        </v-card-text>
      </v-card>
    </v-card>
  </div>
</template>

<script>
let stream = null;

export default {
  props: {
    podNamespace: {
      type: String
    },
    podName: {
      type: String
    }
  },
  data() {
    return {
      logdata: [],
      connected: false,
      errMessage: "",
      wrap: true
    };
  },
  mounted() {
    this.startLogging();
  },
  beforeDestroy() {
    this.stopLogging();
  },
  methods: {
    startLogging: async function() {
      const kubeclient = require("kubernetes-client");
      const client = new kubeclient.Client1_13();
      try {
        var pod_details = await client.api.v1.namespaces(this.podNamespace).pods(this.podName).get();
        var container_name = pod_details.body.spec.containers[0].name;

        stream = await client.api.v1.namespaces(this.podNamespace).pods(this.podName).log.getByteStream({
          qs: {
            container: container_name,
            tailLines: 10,
            follow: true
          }
        });
        this.connected = true;

        stream.on("data", object => {
          if (this.logdata.length > 10000) {
            this.logdata.splice(0, 500);
          }
          this.logdata.push(object);
        });
      } catch (e) {
        this.connected = false;
        this.errMessage = "[Error] " + e;
      }
    },
    stopLogging: function() {
      if (stream != null) {
        stream.abort();
        stream = null;
      }
      this.logdata.length = 0;
    },
    testFunction: function() {
      console.log("Adding");
      var s = this.logdata[this.logdata.length - 1];
      this.logdata.push("Text " + ((s) ? s : ""));
    }
  }
};
</script>

<style scoped>
.fab-horizontal {
  position: absolute;
  right: 0;
  margin-right: 10px;
  margin: 5px;
}
.btn-margin {
  margin: 3px;
}
.my-text-wrap {
  white-space: pre-wrap;
}
.my-text-no-wrap {
  white-space: nowrap;
}
</style>
