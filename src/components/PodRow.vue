<template>
  <tr>
    <td>{{pod_namespace}}</td>
    <td>{{pod_name}}</td>
    <td>{{pod_container_status}}</td>
    <td class="row-centered">
      <v-chip outlined ripple :color="pod_status_color">{{pod_status}}</v-chip>
    </td>
    <td>{{pod_pod_ip}}</td>
    <td>
      <v-menu left offset-y open-on-click>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on">mdi-menu</v-icon>
        </template>
        <v-list dense>
          <v-list-item v-for="(item, index) in actions" :key="index" @click="item.action()">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
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
    return {
      actions: [
        {
          title: "View Logs",
          action: this.viewLogsAction
        },
        {
          title: "Delete",
          action: this.deleteAction
        }
      ]
    };
  },
  computed: {
    pod_name: function() {
      return this.row.metadata.name;
    },
    pod_namespace: function() {
      return this.row.metadata.namespace;
    },
    pod_container_status: function() {
      var restartCount = 0;
      var containerReady = 0;
      var numContainer = this.row.spec.containers.length;
      if (this.row.status.containerStatuses) {
        this.row.status.containerStatuses.forEach(element => {
          containerReady += element.ready ? 1 : 0;
          restartCount += element.restartCount;
        });
      }
      return containerReady + "/" + numContainer + "::" + restartCount;
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
      return "yellow";
    },
    pod_pod_ip: function() {
      return this.row.status.podIP;
    }
  },
  methods: {
    pod_action: function() {
      console.log(this.row.metadata.name);
    },
    deleteAction: function() {
      console.log(
        "Calling Delete Pods for " + this.pod_namespace + "." + this.pod_name
      );
      this.$emit('delete_pod', this.pod_namespace, this.pod_name);
    },
    viewLogsAction: function() {
      console.log(
        "Calling View Logs for " + this.pod_namespace + "." + this.pod_name
      );
      this.$emit('view_log', this.pod_namespace, this.pod_name);
    }
  }
};
</script>

<style>
.row-centered {
  text-align: center;
}
</style>