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

const client = new kubeclient.Client({ version: '1.13' });

function test() {
  return client.api.v1.pods.get().then((res) => {
        return {
            "status": true,
            "data": res.body
        }
    }, (err) => {
        console.log("Error" + err);
        return {
            "status": false,
            "data": err
        }
    });
}

async function check() {
  console.log("I am here");
  test();
  return;
}

var d = check();

console.log(d);

