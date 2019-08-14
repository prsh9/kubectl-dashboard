Vue.component('k8-table', {
    props: {
        k8data: {
            type: Object
        }
    },
    data: function () {
        return { 
            headers: ["NameSpace", "Name", "Status"]
        }
    },
    computed: {
        pod_rows: function() {
            if(this.k8data.status) {
                return this.k8data.data.items;    
            }
            else {
                return [];
            }
        },
        status: function() {
            return this.k8data.status;
        },
        status_color: function() {
            
        }
    },
    methods: {
    }
});

Vue.component('pod-row', {
    props: {
        row: {
            type: Object
        }
    },
    data: function() {
        return {

        }
    },
    template: `<tr>
    <td>{{pod_namespace}}</td>
    <td>{{pod_name}}</td>
    <td :class="pod_status_color">{{pod_status}}</td>
    <td v-on:click="action_clicked()">...</td>
    </tr>
    `,
    computed: {
        pod_name: function() {
            return this.row.metadata.name;
        },
        pod_namespace: function() {
            return this.row.metadata.namespace;
        },
        pod_status: function() {
            return this.row.status.phase;
        },
        pod_status_color: function() {
            return this.getStatusColor();
        }
    },
    methods: {
        getStatusColor: function() {
            switch (this.pod_status.toLowerCase()) {
                case "running":
                case "succeeded":
                    return "green";
                    break;
                case "pending":
                    return "yellow";
                    break;
                default:
                    return "red";
            }
        },
        action_clicked: function() {
            console.log("Clicked : " + this.pod_name);
        }
    }
});

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case "running":
        case "succeeded":
            return "green";
        case "pending":
            return "yellow";
        default:
            return "red";
    }
}

function populate_pod_list() {
    return window.k8sApi.listPodForAllNamespaces().then((res) => {
        return {
            "status": true,
            "data": res.body
        }
    }, (err) => {
        console.log("Error");
        return {
            "status": false,
            "data": err
        }
    });
}

function refreshTable(k8table) {
    console.log("Here In Refresh");
    k8promise = populate_pod_list();
    k8promise.then((res) => {
        k8table.k8data = Object.assign({}, k8table.k8data, res);
    });
}

function init() {
    const kc = new window.k8s.KubeConfig();
    kc.loadFromDefault();
    const k8sApi = kc.makeApiClient(k8s.CoreV1Api);
    window.k8sApi = k8sApi;
    window.kc = kc;
}

function initVue() {
    var app = new Vue({
        el: '#headerContent',
        data: {
            content: "KubeCtl Pod Dashboard"
        }
    });

    var k8table = new Vue({
        el: "#k8table",
        data: {
            k8data: {
                status: false
            }
        }
    });

    refreshTable(k8table);

    // setInterval(refreshTable, 2500, k8table);
}

init();
initVue();