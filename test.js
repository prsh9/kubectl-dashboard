const k8s = require('@kubernetes/client-node');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.CoreV1Api);

k8sApi.listPodForAllNamespaces().then((res) => {
    res.body.items.forEach(element => {
        console.log(element);
        console.log("----------");
    });
}, (err) => {
    console.log("Error");
});
