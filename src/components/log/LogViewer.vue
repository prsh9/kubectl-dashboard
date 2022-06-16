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

        <v-btn icon small class="btn-margin" @click="clearConsole" title="Clear Screen">
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn icon small class="btn-margin" @click="exportToFile" title="Save To File">
          <v-icon>mdi-file-download</v-icon>
        </v-btn>
        <v-btn icon small class="btn-margin" @click="wrapChange" title="Wrap">
          <v-icon>{{ wrap ? "mdi-format-text-wrapping-wrap" : "mdi-format-text-wrapping-overflow" }}</v-icon>
        </v-btn>
        <v-btn icon small class="btn-margin" @click="autoScrollFunc" title="AutoScroll">
          <v-icon>{{ autoScroll ? "mdi-arrow-down-bold" : "mdi-arrow-up-down-bold" }}</v-icon>
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

import { ipcRenderer } from 'electron';

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
      
      num_containers: 0,
      currContainer: "",
      
      wrap: true,
      autoScroll: true,
      resizeObserver: ResizeObserver,
      editor: null,

      lines: 0
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
          container_names.push("(init) " + element.name);
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
      this.editor.setHighlightActiveLine(true);
      this.editor.session.setUseWrapMode(this.wrap);
      this.editor.resize();
      this.autoScrollFunc();
      var vm = this;
      this.editor.session.selection.on('changeCursor', function() {
        var cursorRow = vm.editor.session.selection.getCursor().row + 1;
        if(vm.autoScroll && cursorRow < vm.lines) {
          // console.log("Make it false");
          vm.autoScrollFunc()
        }
        else if(!vm.autoScroll && cursorRow >= vm.lines) {
          // console.log("Make it true");
          vm.autoScrollFunc()
        }
        // console.log(`Change cursor - ${vm.lines} : ${cursorRow}`);
      });


    },
    containerChanged: function(element) {
      this.currContainer = element;
      this.stopLogging();
      this.startLogging();
    },
    startLogging: async function() {
      try {
        stream = await this.$store.dispatch('k8Data/getLogStream', 
                                            {
                                              podNamespace: this.logDetails.podNamespace, 
                                              podName: this.logDetails.podName, 
                                              currContainer: this.currContainer
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
      sess.insert({ row: sess.getLength(), column: 0 }, data.toString());
      this.lines = sess.getLength();
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

      var saveDiag = await ipcRenderer.invoke('log.saveFile', options);
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
    autoScrollFunc: function() {
      this.autoScroll = !this.autoScroll
      if(this.autoScroll) {
        this.scrollBottom();
        this.editor.session.on('change', this.dataChangedEvent)
      }
      else {
        this.editor.session.off('change', this.dataChangedEvent);
      }
    },
    dataChangedEvent: function() {
      helper.debounce(this.editor.renderer.scrollToLine(Number.POSITIVE_INFINITY), 500);
    },
    refresh: function() {
      this.stopLogging();
      this.startLogging();
    },
    testFunction: function() {
      this.connected = true;
      console.log("Adding");
      for (let index = 0; index < 20; index++) {
        this.addLog("Text " + (index) + "\n");
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
