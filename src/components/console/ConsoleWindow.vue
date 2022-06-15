<template>
  <v-card flat class="consolecontent">
    <v-app-bar short color="white" flat dense class="appbar-console">
      <h1>Shell {{ podSpec.podNamespace }}/{{ podSpec.podName }}</h1>
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
// import os from 'os';
// import * as pty from 'node-pty';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { } from 'xterm/css/xterm.css';
import * as helper from '../../js/helpers.js';
import { ipcRenderer } from 'electron';

export default {
  name: "ConsoleWindow",
  props: {
    podSpec: {
      type: Object
    },
    shellType: {
      type: String,
      default: "bash"
    }
  },
  data() {
    return {
      term: Terminal,
      fitAddon: FitAddon,
      termId: String,
      // ptyProcess: pty.IPty,
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
    init: function() {
      // var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

      this.term = new Terminal();
      this.fitAddon = new FitAddon();

      this.term.loadAddon(this.fitAddon);

      this.term.open(this.$refs.terminal);

      this.termId = this.podSpec.podUid;
      ipcRenderer.send('spawnTerm', this.termId)

      // this.ptyProcess = pty.spawn(shell, [], {
      //   name: this.podSpec.podUid,
      //   cwd: os.homedir(),
      //   env: remote.getGlobal('process').env
      // });

      this.fitAddon.fit();
      var col = this.term.cols;
      var row = this.term.rows;
      this.resizePty(col, row)
      // this.ptyProcess.resize(col, row)
      this.term.focus();

      this.resizeObserver = new ResizeObserver(helper.debounce(this.checkResize, 500))
      this.resizeObserver.observe(this.$refs.terminal)

      var command = "kubectl exec -it " + this.podSpec.podName + " " + this.shellType + " -n " + this.podSpec.podNamespace + "; exit\r";
      ipcRenderer.send('terminal.keystroke.' + this.termId, command)
      // this.ptyProcess.write(command);

      ipcRenderer.on('terminal.incomingData.' + this.termId, (_, data) => {
        this.term.write(data)
      })

      // this.ptyProcess.onData((data) => {
      //   this.term.write(data);
      // });

      this.term.onData((data) => {
        ipcRenderer.send('terminal.keystroke.' + this.termId, data)
        // this.ptyProcess.write(data);
      })
    },
    onResize: function() {
      if (this.fitAddon ) {
        this.fitAddon.fit();

        var col = this.term.cols;
        var row = this.term.rows;
        this.resizePty(col, row)
        // this.ptyProcess.resize(col, row)
      }
    },
    resizePty: function(cols, rows) {
      ipcRenderer.send("terminal.resize." + this.termId, { cols, rows })
    },
    onClose: function() {
      this.fitAddon.dispose();
      ipcRenderer.send('remTerm', this.id)
      // this.ptyProcess.kill();
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
