import os from 'os';
import { ipcMain } from 'electron';
import * as pty from 'node-pty';

let terms = {}

function spawnTerminal(window, id) {
  var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  var ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cwd: process.env.HOME,
    env: process.env
  });

  terms[id] = ptyProcess;
  
  ptyProcess.onData((data) => {
    window.webContents.send("terminal.incomingData." + id, data);
  });

  ipcMain.on("terminal.keystroke." + id, (_, key) => {
      ptyProcess.write(key);
  });

  ipcMain.on("terminal.resize." + id, (_, { cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });
}

function killTerm(id) {
  var p = terms[id];
  p.kill();
  ipcMain.removeListener("terminal.keystroke." + id)
  ipcMain.removeListener("terminal.keystroke." + id)
  delete terms[id];
}

function killAllTerm() {
  Object.keys(terms).forEach((termId) => { 
    killTerm(termId)
  });
}

export function TerminalHelper(window) {

  ipcMain.on('spawnTerm', (_, id) => spawnTerminal(window, id));

  ipcMain.on('killTerm', (_, id) => killTerm(id));

  ipcMain.on('killAllTerm', (_) => killAllTerm());
}
