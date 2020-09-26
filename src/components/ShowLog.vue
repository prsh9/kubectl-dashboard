<template>
  <div>
    <v-card class="log-margin">
      <v-card-title>
        <h3>Logs for <b class="text-capitalize">{{ podNamespace }} - {{ podName }}</b></h3>
      </v-card-title>

      <v-select v-if="num_containers &gt; 1" class="select-margin"
        v-model="currContainer" :items="get_container_names" menu-props="auto" label="Select" @change="containerChanged"
      ></v-select>

      <v-card flat>
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
        <v-sheet class="overflow-y-auto logsheet" :max-height="logWindowHeight">
          <v-card-text id="logWindow" ref="logwindow">
            <pre v-if="!connected">{{ errMessage }}</pre>
            <pre v-else :class="[wrap ? 'my-text-wrap' : 'my-text-no-wrap']" v-for="(text, index) in logdata" :key="text + '=' + index">{{ text }}</pre>
          </v-card-text>
        </v-sheet>
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
      addTimestamps: false,
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

      if(this.pod_spec.spec.initContainers) {
        this.pod_spec.spec.initContainers.forEach(element => {
          container_names.push(element.name);
        });
      }
      return container_names;
    },
    logWindowHeight: function() {
      if(this.num_containers > 1) {
        return "75vh";
      }
      return "83vh";
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
        if(this.pod_spec.spec.initContainers) {
          this.num_containers += this.pod_spec.spec.initContainers.length
        }
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
            tailLines: 100,
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
      if (this.logdata.length > 10000) {
        this.logdata.splice(0, 500);
      }
      this.logdata.push(data);
      // this.$nextTick(function() {
      //   this.scrollBottom();
      // })
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
}
.select-margin{
  margin-left: 10px;
  margin-right: 10px;
}
.log-margin {
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 30px;
}
</style>
