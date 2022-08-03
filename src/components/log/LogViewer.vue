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
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon small v-bind="attrs" v-on="on" class="btn-margin" title="Syntax">
              <v-icon>mdi-pencil-outline</v-icon>
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item-group active-class="teal--text text--accent-4" :value="syntaxModeIndex" v-model="syntaxModeIndex">
              <v-list-item v-for="item in syntaxHighlighters" :key="item.title" @click="setMode(item.mode)">
                <v-list-item-content>{{ item.title }}</v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
        <v-btn icon small class="btn-margin" @click="themeChanged" title="Theme">
          <v-icon>{{ darkTheme ? "mdi-weather-night" : "mdi-white-balance-sunny" }}</v-icon>
        </v-btn>
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
require("ace-builds/webpack-resolver");

ace.config.set('basePath', 'ace-builds/src-min-noconflict/ace')

import * as helper from '../../js/helpers.js';
import { ipcRenderer } from 'electron';
import * as fs from 'fs';
import { LogData } from '../../js/k8_data_helpers.js';

export default {
  props: {
    logDetails: {
      type: LogData
    }
  },
  data() {
    return {
      syntaxHighlighters: [
        { title: 'Text', mode: 'ace/mode/text' },
        { title: 'Json', mode: 'ace/mode/json5' },
        { title: 'XML', mode: 'ace/mode/xml' },
      ],
      syntaxModeIndex: 1,
      darkTheme: false,

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
      this.logDetails.containerNames.forEach(element => {
        container_names.push({ text: element, value: element });
      })
      
      if(this.logDetails.initContainerNames) {
        this.logDetails.initContainerNames.forEach(element => {
          container_names.push({ text: "(init) " + element, value: element });
        })
        
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
      this.num_containers = this.logDetails.containerNames.length;
      this.num_containers += this.logDetails.initContainerNames.length;
      this.currContainer = this.logDetails.containerNames[0];

      this.resizeObserver = new ResizeObserver(helper.debounce(this.checkResize, 500))
      this.resizeObserver.observe(this.$refs.logwindow)

      this.startLogging();
    },
    initAceEditor: function() {
      this.editor = ace.edit(this.$refs.logwindow, {
        // autoScrollEditorIntoView: true,
      });
      this.editor.setReadOnly(true);
      this.editor.setHighlightActiveLine(true);
      this.editor.session.setUseWrapMode(this.wrap);
      this.editor.resize();
      var mode = this.syntaxHighlighters[this.syntaxModeIndex].mode;
      this.setMode(mode)
      this.setTheme();
      this.autoScrollFunc();
      var vm = this;
      this.editor.session.selection.on('changeCursor', function() {
        var cursorRow = vm.editor.session.selection.getCursor().row + 1;
        if(vm.autoScroll && cursorRow < vm.lines) {
          vm.autoScrollFunc()
        }
        else if(!vm.autoScroll && cursorRow >= vm.lines) {
          vm.autoScrollFunc()
        }
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
    setMode: function(mode) {
      this.editor.session.setMode(mode)
    },
    themeChanged: function() {
      this.darkTheme = !this.darkTheme;
      this.setTheme();
    },
    setTheme: function() {
      var theme = 'ace/theme/textmate';
      if(this.darkTheme) {
        theme = 'ace/theme/terminal';
      }
      this.editor.setTheme(theme)
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
