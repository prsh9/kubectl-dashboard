// function getEnvVar() {
//   var e = {}
//   for (var key in process.env) {
//     e[key] = process.env[key];
//   }
//   return e;
// //  console.log(process.env);
// }

// console.log(JSON.stringify(getEnvVar()))

const kubeclient = require("kubernetes-client");
const JSONStream = require("json-stream")

const client = new kubeclient.Client({ version: '1.13' });

async function main() {
var stream = await client.api.v1.namespaces('default').pods('x15n0-0').log.getByteStream({
  qs: {
    tailLines: 10,
    follow: true
  }
});

stream.on('data', object => {
    console.log('Log event:', JSON.stringify(object.toString(), null, 2));
  })
}

main()