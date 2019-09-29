<template>
  <tr>
    <td>{{pod_namespace}}</td>
    <td>{{pod_name}}</td>
    <td>
      <v-chip outlined ripple :color="pod_status_color">{{pod_status}}</v-chip>
    </td>
    <td>{{pod_pod_ip}}</td>
    <td>
      <v-icon @click="pod_action()">mdi-menu</v-icon>
    </td>
  </tr>
</template>
        
<script>
export default {
  props: {
    row: {
      type: Object
    }
  },
  data() {
    return {};
  },
  computed: {
    pod_name: function() {
      return this.row.metadata.name;
    },
    pod_namespace: function() {
      return this.row.metadata.namespace;
    },
    pod_status: function() {
      var phase = this.row.status.phase;
      if (phase == "Failed" && this.row.status.reason) {
        phase = this.row.status.reason;
      }

      return phase;
    },
    pod_status_color: function() {
      switch (this.row.status.phase) {
        case "Pending":
          return "orange";
        case "Running":
          return "green";
        case "Succeeded":
          return "purple";
        case "Failed":
          return "red";
        case "Unknown":
          return "indigo";
      }
      return "yellow"
    },
    pod_pod_ip: function() {
      return this.row.status.podIP;
    }
  },
  methods: {
    pod_action: function() {
      console.log(this.row.metadata.name);
    }
  }
};
</script>
