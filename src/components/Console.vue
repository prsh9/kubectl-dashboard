<template>
  <div>
    Console for {{ podSpec.podNamespace }} - {{ podSpec.podName }}
    <div ref="terminal" class=""></div>
  </div>
</template>

<script>
import os from 'os';
import * as pty from 'node-pty';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { } from 'xterm/css/xterm.css'
import { debounce } from '../js/helpers.js'

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
      fitAddon: FitAddon
    };
  },
  mounted() {
    this.init();
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.onResize)
    this.term.dispose()
    this.fitAddon.dispose()
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

      window.addEventListener('resize', debounce(this.onResize, 500, true));
    },
    onResize: function() {
      if (this.fitAddon ) {
      this.fitAddon.fit();
      }
    }
  }
};
</script>

