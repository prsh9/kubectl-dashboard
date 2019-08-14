// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const k8s = require('@kubernetes/client-node');
const handlebars = require('handlebars');

function init() {
//  const kc = new k8s.KubeConfig();
//  kc.loadFromDefault();
//  const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
  window.k8s = k8s;
//  window.k8sApi = k8sApi;
  window.handlebars = handlebars;
}

const _setImmediate = setImmediate
const _clearImmediate = clearImmediate
process.once('loaded', () => {
  global.setImmediate = _setImmediate
  global.clearImmediate = _clearImmediate
})

init();

