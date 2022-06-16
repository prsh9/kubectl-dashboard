import os from 'os';
import { ipcMain } from 'electron';
import * as pty from 'node-pty';

let terms = {}

function spawnNewTerminal(window, id) {
  var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  if(terms[id]) {
    killTerm(id)
  }

  var ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cwd: process.env.HOME,
    env: process.env
  });

  // store the process for the id
  terms[id] = ptyProcess;
  
  // send the data back on unique channel
  ptyProcess.onData((data) => {
    window.webContents.send("terminal.incomingData." + id, data);
  });

  ipcMain.on("terminal.keystroke." + id, (_, key) => {
    if(terms[id]) {
      try {
        ptyProcess.write(key);
      } catch(e) {
        console.log("Error handling keystroke for terminal " + e);
        killTerm(id)
      }
    }
    else {
      console.warn("keystroke for undefined terminal : " + id)
    }
  });

  ipcMain.on("terminal.resize." + id, (_, { cols, rows }) => {
    if(terms[id]) {
      try {
        ptyProcess.resize(cols, rows);
      } catch(e) {
        console.log("Error handling resize for terminal " + e);
      }
    }
    else {
      console.warn("resize for undefined terminal : " + id)
    }
  });

  return true;
}

function killTerm(id) {
  var p = terms[id];
  if(p) {
    p.kill();
  }
  ipcMain.removeAllListeners("terminal.keystroke." + id)
  ipcMain.removeAllListeners("terminal.resize." + id)
  delete terms[id];
}

export function killAllTerm() {
  Object.keys(terms).forEach((termId) => { 
    killTerm(termId)
  });
}

export function TerminalHelper(window) {

  ipcMain.handle('terminal.spawn', (_, id) => spawnNewTerminal(window, id))

  ipcMain.on('killTerm', (_, id) => killTerm(id));

  ipcMain.on('killAllTerm', (_) => killAllTerm());
}
