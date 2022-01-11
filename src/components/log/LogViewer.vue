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

        <v-btn icon x-small class="btn-margin" @click="clearConsole" title="Clear Screen">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="exportToFile" title="Save To File">
          <v-icon>mdi-file-download</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="wrapChange" title="Wrap">
          <v-icon>{{ wrap ? "mdi-format-text-wrapping-wrap" : "mdi-format-text-wrapping-overflow" }}</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="scrollBottom" title="Scroll To End">
          <v-icon>mdi-format-vertical-align-bottom</v-icon>
        </v-btn>
        <v-btn icon x-small class="btn-margin" @click="refresh" title="Refresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-app-bar>
      <v-card flat class="overflow-y-auto logsheet">
        <v-card-text class="logwindow" ref="logwindow">
        </v-card-text>
      </v-card>
    </v-card>
  </v-card>
</template>

<script>
let stream = null;

import * as ace from "ace-builds/src-min-noconflict/ace";
import {} from "ace-builds/webpack-resolver";

import * as helper from '../../js/helpers.js';

import { remote } from 'electron';

import * as fs from 'fs';

export default {
  props: {
    logDetails: {
      type: Object
    }
  },
  data() {
    return {
      connected: false,
      errMessage: "",
      
      addTimestamps: false,
      
      num_containers: 0,
      currContainer: "",
      
      wrap: false,
      resizeObserver: ResizeObserver,
      editor: null
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
    this.initAceEditor();
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
    initAceEditor: function() {
      this.editor = ace.edit(this.$refs.logwindow, {
        autoScrollEditorIntoView: true,
      });
      this.editor.setReadOnly(true);
      this.editor.session.setUseWrapMode(this.wrap);
      this.editor.resize();
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
      var sess = this.editor.session;
      sess.insert({ row: sess.getLength(), column: 0 }, data.toString() );
    },
    close: function() {
      this.resizeObserver.disconnect();
      this.editor.destroy();
    },
    checkResize: function(event) {
      if(event) {
        this.editor.resize()
      }
    },
    clearConsole: function() {
      this.editor.setValue("");
      this.$forceUpdate();
    },
    exportToFile: async function() {
      var options = {
          title: "Export Log",
          defaultPath : this.logDetails.podName + "-" + new Date().toISOString().slice(0, 10) + ".txt",
          buttonLabel : "Export",

          filters :[
              {name: 'txt', extensions: ['txt']},
              {name: 'log', extensions: ['log']},
              {name: 'All Files', extensions: ['*']}
          ]
      };

      var saveDiag = await remote.dialog.showSaveDialog(null, options);
      if(!saveDiag.canceled) {
        var path = saveDiag.filePath;
        fs.writeFileSync(path, this.editor.session.toString(), 'utf-8');
      }
    },
    wrapChange: function() {
      this.wrap = !this.wrap
      this.editor.session.setUseWrapMode(this.wrap);
    },
    scrollBottom: function() {
      this.editor.scrollToLine(this.editor.session.getLength(), false, true, null)
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
  display: flex;
  height: 100%;
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
  height: 100%;
}
</style>
