import Vue from 'vue';

const kubeclient = require("kubernetes-client");
const client = new kubeclient.Client1_13();

function getKey(podItem) {
  return podItem.metadata.uid;
}

var podStream = null;

// shape: [{ id, quantity }]
const state = {
    pod_data: {
        metadata: null, 
        items: {} 
    },
    status: false,
    message: "Loading",
    svc: {
      status: false,
      message: "Loading",
      svc_data: {
        metadata: null,
        items: {}
      }
    }
}

// getters
const getters = {
  getMessage: (state) => {
    return state.message;
  },
  getStatus: (state) => {
    return state.status;
  },
  orderedPodItems: (state) => {
    var sorted = [];
    if (state.status) {
      sorted = Object.values(state.pod_data.items);
      sorted.sort(function(a, b) {
        if(a.metadata.namespace == b.metadata.namespace) {
          if(a.metadata.name == b.metadata.name) {
            return a.metadata.uid.localeCompare(b.metadata.uid);
          }
          return a.metadata.name.localeCompare(b.metadata.name);
        }
        return a.metadata.namespace.localeCompare(b.metadata.namespace);
      });
    }
    return sorted;
  },
  getPodData: (state) => (podUid) => {
    return state.pod_data.items[podUid];
  },
  getSvcMessage: (state) => {
    return state.svc.message;
  },
  getSvcStatus: (state) => {
    return state.svc.status;
  },
  orderedSvcItems: (state) => {
    var sorted = [];
    if (state.svc.status) {
      sorted = Object.values(state.svc.svc_data.items);
      sorted.sort(function(a, b) {
        if(a.metadata.namespace == b.metadata.namespace) {
          if(a.metadata.name == b.metadata.name) {
            return a.metadata.uid.localeCompare(b.metadata.uid);
          }
          return a.metadata.name.localeCompare(b.metadata.name);
        }
        return a.metadata.namespace.localeCompare(b.metadata.namespace);
      });
    }
    return sorted;
  },
  getSvcData: (state) => (svcUid) => {
    return state.svc.svc_data.items[svcUid];
  },
}

// actions
const actions = {
  stopPodWatch: function() {
    return new Promise((resolve) => {
      if (podStream) {
        podStream.destroy();
        podStream = null;
      }
      resolve();
    });
  },
  fetchPodData: function({ commit }) {
    return new Promise((resolve, reject) => {
      client.api.v1.pods.get().then(
        res => {
          var podData = {
            items: {} 
          };
          podData.metadata = res.body.metadata;
          for (var item in res.body.items) {
            var itemdata = res.body.items[item];
            var objKey = getKey(itemdata);
  
            podData.items[objKey] = itemdata;
          }
          
          commit('setStatusAndPodData', {podConnStatus: true, message: "Success", podData: podData});
          resolve();
        },
        err => {
          console.log("Error (getPodData) " + err);
          commit('setStatusAndPodData', { podConnStatus: false, message: err , podData: { metadata: null, items: {} }});
          reject();
        }
      );
    });    
  },
  watchPodData: async function({ commit, state }) {
    var rv = state.pod_data.metadata.resourceVersion;
    podStream = await client.api.v1.watch.pods.getObjectStream({
      qs: {
        resourceVersion: rv,
      }
    });

    podStream.on("data", res => {
      var pod_item = res.object;
      if (res.type === "ADDED") {
        // eslint-disable-next-line
        pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(
          res.object
        );
        commit('setPodItem', pod_item);
        console.log("new object : " + pod_item.metadata.name + " : " + pod_item.metadata.uid);
      } else if (res.type === "MODIFIED") {
        // eslint-disable-next-line
        pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(
          res.object
        );
        commit('setPodItem', pod_item);
        console.log("changed object : " + pod_item.metadata.name + " : " + pod_item.metadata.uid);
      } else if (res.type === "DELETED") {
        // eslint-disable-next-line
        pod_item = (({ kind, apiVersion, ...others }) => ({ ...others }))(
          res.object
        );
        commit('deletePodItem', pod_item);
        console.log("deleted object : " + pod_item.metadata.name + " : " + pod_item.metadata.uid);
      } else {
        console.error("unknown type: " + JSON.stringify(res));
      }
    });
  },
  deletePod: function({ state }, pod_uid) {
    var podToRemove = state.pod_data.items[pod_uid];
    if(podToRemove) {
      var namespace = podToRemove.metadata.namespace;
      var name = podToRemove.metadata.name;
      client.api.v1.namespaces(namespace).pods(name).delete();
    }
  },
  fetchSvcData: function({ commit }) {
    return new Promise((resolve, reject) => {
      client.api.v1.services.get().then(
        res => {
          var svcData = {
            items: {} 
          };
          svcData.metadata = res.body.metadata; 
          for (var item in res.body.items) {
            var itemdata = res.body.items[item];
            var objKey = getKey(itemdata);
  
            svcData.items[objKey] = itemdata;
          }
          
          commit('setStatusAndSvcData', {connStatus: true, message: "Success", svcData: svcData});
          resolve();
        },
        err => {
          console.log("Error (getSvcData) " + err);
          commit('setStatusAndSvcData', { connStatus: false, message: err , svcData: { metadata: null, items: {} }});
          reject();
        }
      );
    });    
  },
}

// mutations
const mutations = {
  setStatusAndPodData (state, { podConnStatus, message, podData }) {
      state.status = podConnStatus;
      state.message = message;
      Vue.set(state, 'pod_data', podData);
  },
  setPodItem (state, podData) {
    Vue.set(state.pod_data.items, getKey(podData), podData);
  },
  deletePodItem(state, podData) {
    Vue.delete(state.pod_data.items, getKey(podData));
  },
  setStatusAndSvcData (state, { connStatus, message, svcData}) {
    state.svc.status = connStatus;
    state.svc.message = message;
    Vue.set(state.svc, 'svc_data', svcData);
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
