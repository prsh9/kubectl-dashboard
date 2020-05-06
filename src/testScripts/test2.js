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
const JSONStream = require('JSONStream');

const client = new kubeclient.Client({ version: '1.13' });

async function main() {
var data = await client.api.v1.pods.get();
console.log(JSON.stringify(data.body.metadata.resourceVersion));
return data;
}

async function watch(data) {
  
  var rv = data.body.metadata.resourceVersion;

  var stream = await client.api.v1.watch.pods.getObjectStream(//{
  // var stream = await client.api.v1.pods.getStream({
    // qs: {
      // resourceVersion: rv,
      // watch: 1
    // }
  //});
  );

  // console.log(stream);
  // var s = JSONStream.parse()
  // stream.pipe(s);

  var i = 0;
  stream.on('data', object => {
    i++
    console.log('Log event:', object);
    console.log(i);
    if(i == 2) {
      // stream.abort();
      stream.destroy();
    }
  })
}

var d = main()
d.then(res => {
  // console.log(res);
  watch(res);
})