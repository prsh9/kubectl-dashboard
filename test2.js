const k8s = require('kubernetes-client')

async function main() {
const client = new k8s.Client({ version: '1.13' })
const namespaces = await client.api.v1.pods.get()
console.log('Pods: ', namespaces)
}

main()
