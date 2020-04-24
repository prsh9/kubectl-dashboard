<template>
  <div>
    <v-card>
      <v-card-title>
        <h3>Logs for <b class="text-capitalize">{{ podNamespace }} - {{ podName }}</b></h3>
        <v-layout row class="fab-horizontal">
          <v-btn color="cyan" depressed fab x-small class="btn-margin" @click="clearConsole">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-btn color="cyan" depressed fab x-small class="btn-margin" @click="wrap = !wrap">
            <v-icon>{{wrap ? 'mdi-format-text-wrapping-wrap' : 'mdi-format-text-wrapping-overflow'}}</v-icon>
          </v-btn>
          <v-btn color="cyan" depressed fab x-small class="btn-margin" @click="scrollBottom">
            <v-icon>mdi-format-vertical-align-bottom</v-icon>
          </v-btn>
        </v-layout>
      </v-card-title>
      <v-card-subtitle v-if="num_containers &gt; 1">
        <v-select
          v-model="currContainer"
          :items="get_container_names"
          menu-props="auto"
          label="Select Container"
          @change="containerChanged"></v-select>
      </v-card-subtitle>

      <v-card class="overflow-y-auto" max-height="75vh" flat outlined>
        <v-card-text id="logWindow" ref="logwindow" max-height="75vh">
          <pre v-if="!connected">{{errMessage}}</pre>
          <pre v-else :class="[wrap ? 'my-text-wrap' : 'my-text-no-wrap']" v-for="(text, index) in logdata" :key="text + '=' +index">{{text}}</pre>
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
      wrap: true,
      pod_spec: null,
      currContainer: "",
      num_containers: 0
    };
  },
  computed: {
    get_container_names: function() {
      var container_names = [];
      
      if(this.pod_spec) {
        this.pod_spec.spec.containers.forEach(element => {
          container_names.push(element.name);
        });
      }

      return container_names;
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.stopLogging();
  },
  methods: {
    init: async function() {
      const kubeclient = require("kubernetes-client");
      const client = new kubeclient.Client1_13();
      try {
        var pod_details = await client.api.v1.namespaces(this.podNamespace).pods(this.podName).get();
        this.pod_spec = pod_details.body;
        this.num_containers = this.pod_spec.spec.containers.length;
        this.currContainer = this.pod_spec.spec.containers[0].name;

        this.startLogging();
      } catch (e) {
        this.connected = false;
        this.errMessage = "[Error] " + e;
      }
    },
    containerChanged: function(element) {
      this.currContainer = element;
      this.stopLogging();
      this.startLogging();
    },
    startLogging: async function() {
      const kubeclient = require("kubernetes-client");
      const client = new kubeclient.Client1_13();
      try {
        stream = await client.api.v1.namespaces(this.podNamespace).pods(this.podName).log.getByteStream({
          qs: {
            container: this.currContainer,
            tailLines: 1000,
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
      this.clearConsole();
    },
    clearConsole: function() {
      this.logdata.length = 0;
      this.$forceUpdate();
    },
    scrollBottom: function() {
      this.$refs.logwindow.lastChild.scrollIntoView();
    },
    testFunction: function() {
      this.connected = true;
      console.log("Adding");
      var s = this.logdata[this.logdata.length - 1];
      for (let index = 0; index < 10; index++) {
        this.logdata.push("Text " + ((s) ? s : ""));
        this.$nextTick(function() {
          this.scrollBottom();
        })
      }
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
