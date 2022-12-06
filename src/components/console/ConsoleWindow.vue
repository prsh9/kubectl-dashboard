<template>
  <v-card flat class="consolecontent">
    <v-app-bar short color="white" flat dense class="appbar-console">
      <h1>Shell {{ consoleSpec.podNamespace }}/{{ consoleSpec.podName }}</h1>
      <div class="appbar-btns">
        <v-btn icon small class="btn-margin" @click="onResize" title="Resize">
          <v-icon>mdi-fit-to-page</v-icon>
        </v-btn>
        <v-btn icon small class="btn-margin" @click="refresh" title="Refresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </v-app-bar>
    <div ref="terminal" class="term-margin"></div>
  </v-card>
</template>

<script>
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { } from 'xterm/css/xterm.css';
import * as helper from '../../js/helpers.js';
import { ipcRenderer } from 'electron';
import { randomUUID } from 'crypto';
import { ConsoleData } from '../../js/k8_data_helpers.js'
 
export default {
  name: "ConsoleWindow",
  props: {
    consoleSpec: {
      type: ConsoleData
    }
  },
  data() {
    return {
      term: Terminal,
      fitAddon: FitAddon,
      termId: String,
      resizeObserver: ResizeObserver,
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    this.onClose();
  },
  methods: {
    init: async function() {
      this.term = new Terminal();
      this.fitAddon = new FitAddon();

      this.term.loadAddon(this.fitAddon);

      this.term.open(this.$refs.terminal);

      // this.termId = this.consoleSpec.podUid;
      this.termId = randomUUID();
      console.log("Term  : " + this.termId);

      await ipcRenderer.invoke('terminal.spawn', this.termId)

      this.fitAddon.fit();
      var col = this.term.cols;
      var row = this.term.rows;
      this.resizePty(col, row)
      this.term.focus();

      this.resizeObserver = new ResizeObserver(helper.debounce(this.checkResize, 500))
      this.resizeObserver.observe(this.$refs.terminal)

      var command = "kubectl exec -it " + this.consoleSpec.podName + " " + this.consoleSpec.shellType + " -n " + this.consoleSpec.podNamespace + "; exit\r";
      ipcRenderer.send('terminal.keystroke.' + this.termId, command)

      ipcRenderer.on('terminal.incomingData.' + this.termId, (_, data) => {
        this.term.write(data)
      })

      this.term.onData((data) => {
        ipcRenderer.send('terminal.keystroke.' + this.termId, data)
      })
    },
    onResize: function() {
      if (this.fitAddon ) {
        this.fitAddon.fit();

        var col = this.term.cols;
        var row = this.term.rows;
        this.resizePty(col, row)
      }
    },
    resizePty: function(cols, rows) {
      ipcRenderer.send("terminal.resize." + this.termId, { cols, rows })
    },
    onClose: function() {
      this.fitAddon.dispose();
      ipcRenderer.removeAllListeners('terminal.incomingData.' + this.termId)
      ipcRenderer.send('killTerm', this.termId)
      this.term.dispose();
      this.resizeObserver.disconnect();
    },
    refresh: function() {
      this.onClose();
      this.init();
    },
    checkResize: function(event) {
      for (let entry of event) {
        if(entry.contentRect && entry.contentRect.height > 0) {
          this.onResize()
        }
      }
    }
  }
};
</script>

<style>
.consolecontent{
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.appbar-btns {
  margin-left: auto;
}
.btn-margin {
  margin: 3px; 
}
.term-margin {
  display: flex;
  margin: 5px;
  align-self: stretch;
  flex-grow: 6;
}
.appbar-console {
  display: flex;
}
.appbar-console > .v-toolbar__content {
  display: flex;
  flex-grow: 1;
}
</style>
