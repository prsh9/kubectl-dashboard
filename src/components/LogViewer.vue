<template>
  <v-card outlined class="logcontent log-margin">
    <v-card-title>
      <h3>Logs for <b class="text-capitalize">{{ logDetails.podNamespace }} - {{ logDetails.podName }}</b></h3>
    </v-card-title>

    <v-select v-if="num_containers &gt; 1" class="select-margin"
      v-model="currContainer" :items="get_container_names" menu-props="auto" label="Select" @change="containerChanged"
    ></v-select>

    <v-card flat class="parentcard">
      <v-app-bar flat dense>
        <v-spacer></v-spacer>

        <v-btn icon x-small class="btn-margin" @click="clearConsole">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="wrap = !wrap">
          <v-icon>{{ wrap ? "mdi-format-text-wrapping-wrap" : "mdi-format-text-wrapping-overflow" }}</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="scrollBottom">
          <v-icon>mdi-format-vertical-align-bottom</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="refresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-app-bar>
      <v-card flat class="logsheet">
        <v-card-text id="logWindow" ref="logwindow">
          <pre v-if="!connected">{{ errMessage }}</pre>
          <pre v-else :class="[wrap ? 'my-text-wrap' : 'my-text-no-wrap']" v-for="(text, index) in logdata" :key="text + '=' + index">{{ text }}</pre>
        </v-card-text>
      </v-card>
    </v-card>
  </v-card>
</template>

<script>
let stream = null;

import * as helper from '../js/helpers.js';

export default {
  props: {
    logDetails: {
      type: Object
    }
  },
  data() {
    return {
      logdata: [],
      connected: false,
      addTimestamps: false,
      errMessage: "",
      wrap: true,
      currContainer: "",
      num_containers: 0,
      resizeObserver: ResizeObserver,
    };
  },
  computed: {
    get_container_names: function() {
      var container_names = [];
      var pod_spec = this.logDetails.podSpec
      if(pod_spec) {
        pod_spec.spec.containers.forEach(element => {
          container_names.push(element.name);
        });
      }

      if(pod_spec.spec.initContainers) {
        pod_spec.spec.initContainers.forEach(element => {
          container_names.push(element.name);
        });
      }
      return container_names;
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.stopLogging();
    this.close();
  },
  methods: {
    init: async function() {
      var pod_spec = this.logDetails.podSpec;
      this.num_containers = pod_spec.spec.containers.length;
      if(pod_spec.spec.initContainers) {
        this.num_containers += pod_spec.spec.initContainers.length
      }
      this.currContainer = pod_spec.spec.containers[0].name;

      this.resizeObserver = new ResizeObserver(helper.debounce(this.checkResize, 500))
      this.resizeObserver.observe(this.$refs.logwindow)

      this.startLogging();
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
        stream = await client.api.v1.namespaces(this.logDetails.podNamespace).pods(this.logDetails.podName).log.getByteStream({
          qs: {
            container: this.currContainer,
            tailLines: 10000,
            follow: true,
            timestamps: this.addTimestamps
          }
        });
        this.connected = true;

        stream.on("data", object => {
          this.addLog(object)
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
    addLog: function(data) {
      if (this.logdata.length > 100000) {
        this.logdata.splice(0, 500);
      }
      this.logdata.push(data);
    },
    close: function() {
      this.resizeObserver.disconnect();
    },
    checkResize: function() {
      var i = this.$refs.logwindow
      if(i) {
        var windowHeight = window.innerHeight - 250
        if(this.num_containers > 1) {
          windowHeight -= 66
        }
        i.style.maxHeight = windowHeight + "px"
      }
    },
    clearConsole: function() {
      this.logdata.length = 0;
      this.$forceUpdate();
    },
    scrollBottom: function() {
      this.$refs.logwindow.lastChild.scrollIntoView();
    },
    refresh: function() {
      this.stopLogging();
      this.startLogging();
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
.logcontent{
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.fab-horizontal {
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
.logsheet {
  background-color: floralwhite;
  overflow: auto;
}
.select-margin{
  margin-left: 10px;
  margin-right: 10px;
  display: flex;
  flex-shrink: 1;
  max-height: 66px;
}
.log-margin {
  margin-left: 10px;
  margin-right: 10px;
}
.parentcard {
  display: flex;
  flex-direction: column;
}
</style>
