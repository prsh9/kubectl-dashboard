Handlebars = window.handlebars;

Handlebars.registerHelper('status_class', function (status) {
    return "yellow"
});

Handlebars.registerHelper('k8table_row', function (dataToUse) {
    var status_color = getStatusColor(dataToUse.status.phase);
    var resultToUse = `<td>${dataToUse.metadata.namespace}</td>
    <td>${dataToUse.metadata.name}</td>
    <td class="${status_color}">${dataToUse.status.phase}</td>
    `;

    return new Handlebars.SafeString(resultToUse);
});

function getStatusColor(status) {
    switch(status.toLowerCase()) {
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
}

function display_pod_list(k8Data) {
    var template = document.getElementById("k8table-template").innerHTML;
    var compiled_template = Handlebars.compile(template);
    var result = compiled_template({k8Headers: ["NameSpace", "Name", "Status"], data: k8Data});

    var element = document.getElementById("k8table");
    element.innerHTML = result;
}

function displayError(err) {
    var element = document.getElementById("k8table");
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }

    var divElement = document.createElement("div");
    var pElememt = document.createElement("p");
    divElement.appendChild(pElememt);
    pElememt.textContent = "Error : " + err;
    element.appendChild(divElement);
}

function populate_pod_list(k8sApi) {
    k8sApi.listPodForAllNamespaces().then((res) => {
        display_pod_list(res.body.items);
    }, (err) => {
        console.log("Error");
        displayError(err);
    });
}

function refreshTable() {
    populate_pod_list(window.k8sApi);
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
    })
}

init();
initVue();

setInterval(refreshTable, 1000);