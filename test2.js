const k8s = require('kubernetes-client')
const fs = require("fs")

async function main() {
    const client = new k8s.Client({ version: '1.13' })
    const namespaces = await client.api.v1.pods.get()
    console.log('Pods: ', JSON.stringify(namespaces))

    fs.writeFileSync('checkPods.json', JSON.stringify(namespaces));    
}

main()
