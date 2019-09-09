// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const kubeclient = require('kubernetes-client')

function init() {
  window.kubeclient = kubeclient;
}

const _setImmediate = setImmediate
const _clearImmediate = clearImmediate
process.once('loaded', () => {
  global.setImmediate = _setImmediate
  global.clearImmediate = _clearImmediate
})

init();

