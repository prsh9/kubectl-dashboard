<template>
  <div>
    <v-card flat>
      <v-app-bar short color="white" flat dense>
        <h1>Shell {{ podSpec.podNamespace }}/{{ podSpec.podName }}</h1>
        <v-spacer></v-spacer>
        <v-btn icon small class="btn-margin" @click="onResize">
          <v-icon>mdi-fit-to-page</v-icon>
        </v-btn>
        <v-btn icon small class="btn-margin" @click="refresh">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-app-bar>
      <div ref="terminal" class="term-margin"></div>
    </v-card>
  </div>
</template>

<script>
import os from 'os';
import * as pty from 'node-pty';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { } from 'xterm/css/xterm.css'

export default {
  name: "Console",
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
      var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

      this.term = new Terminal();
      this.fitAddon = new FitAddon();

      this.term.loadAddon(this.fitAddon);

      this.term.open(this.$refs.terminal);

      var ptyProcess = pty.spawn(shell, [], {
        name: this.podSpec.podUid,
        cwd: process.env.HOME,
        env: process.env
      });

      this.fitAddon.fit();

      var command = "kubectl exec -it " + this.podSpec.podName + " " + this.shellType + " -n " + this.podSpec.podNamespace + "; exit\r"
      ptyProcess.write(command);

      ptyProcess.onData((data) => {
        this.term.write(data)
      });

      this.term.onData(function(data) {
        ptyProcess.write(data);
      })
    },
    onResize: function() {
      if (this.fitAddon ) {
      this.fitAddon.fit();
      }
    },
    onClose: function() {
      this.term.dispose();
      this.fitAddon.dispose();
    },
    refresh: function() {
      this.onClose();
      this.init();
    }
  }
};
</script>

<style scoped>
.btn-margin {
  margin: 3px;
}
.term-margin {
  margin: 5px;
}
</style>
