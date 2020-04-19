<template>
  <tr>
    <td>{{ pod_namespace }}</td>
    <td>{{ pod_name }}</td>
    <td>
      <div class="min_w_h">
        <v-progress-linear
          :stream="pod_status_actual != 'Failed'"
          rounded
          :color="pod_status_color + ' lighten-3'"
          height="20px"
          :buffer-value="ready_container_percent"
          :value="ready_container_percent"
        >
          <v-spacer></v-spacer>
          {{ num_ready_containers }}/{{ num_comtainers }}
          <v-spacer></v-spacer>
            <v-avatar
            circle
            :color="container_restarts > 0 ? 'red accent-1' : 'teal lighten-4'"
            size="20"
          >
            <span class="white--text">{{container_restarts}}</span>
          </v-avatar>
        </v-progress-linear>
      </div>
    </td>
    <td class="row-centered">
      <v-chip outlined ripple :color="pod_status_color">{{ pod_status_message }}</v-chip>
    </td>
    <td>{{ pod_pod_ip }}</td>
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
      <v-dialog scrollable persistent v-model="dialog">
        <!-- v-if is necessary to mount every time dialog is opened -->
        <DescribeResource
          v-if="dialog"
          resourceType="pod"
          :resourceUID="row.metadata.uid"
          @close="dialog = false"
        ></DescribeResource>
      </v-dialog>
    </td>
  </tr>
</template>

<script>
import DescribeResource from "./DescribeResource.vue";

export default {
  props: {
    row: {
      type: Object
    }
  },
  data() {
    return {
      dialog: false,
      actions: [
        {
          title: "Describe",
          action: this.describeAction
        },
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
    num_comtainers: function() {
      return this.row.spec.containers.length;
    },
    num_ready_containers: function() {
      var containerReady = 0;
      if (this.row.status.containerStatuses) {
        this.row.status.containerStatuses.forEach(element => {
          containerReady += element.ready ? 1 : 0;
        });
      }
      return containerReady;
    },
    ready_container_percent: function() {
      return (this.num_ready_containers / this.num_comtainers) * 100;
    },
    container_restarts: function() {
      var restartCount = 0;
      if (this.row.status.containerStatuses) {
        this.row.status.containerStatuses.forEach(element => {
          restartCount += element.restartCount;
        });
      }
      return restartCount;
    },
    pod_status_actual: function() {
      return this.row.status.phase;
    },
    pod_status_message: function() {
      var phase = this.pod_status_actual;
      if (this.row.status.reason) {
        phase = this.row.status.reason;
        return phase;
      }

      if (phase === "Pending") {
        var status_item = this.row.status;
        if (status_item.initContainerStatuses) {
          var numInit = status_item.initContainerStatuses.length;
          var startInit = 0;
          for (const item of status_item.initContainerStatuses) {
            if (!item.ready) {
              phase = "Init:" + startInit;
              if (item.state) {
                if (item.state.waiting && item.state.waiting.reason) {
                  return phase + "(" + item.state.waiting.reason + ")";
                }
                if (item.state.terminated) {
                  return "Terminating";
                }
              }
              return phase + "/" + numInit;
            }
            startInit++;
          }
        }

        if (status_item.containerStatuses) {
          for (const item of status_item.containerStatuses) {
            if (!item.ready) {
              if (
                item.state &&
                item.state.waiting &&
                item.state.waiting.reason
              ) {
                return item.state.waiting.reason;
              }
              if (item.state && item.state.terminated) {
                phase = "Terminating";
                if (item.state.terminated.reason) {
                  phase = phase + "(" + item.state.terminated.reason + ")";
                }
                return phase;
              }
            }
          }
        }
      }

      return phase;
    },
    pod_status_color: function() {
      switch (this.pod_status_actual) {
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
    deleteAction: function() {
      this.$store.dispatch("deletePod", this.row.metadata.uid);
    },
    viewLogsAction: function() {
      console.log(
        "Calling View Logs for " + this.pod_namespace + "." + this.pod_name
      );
      this.$emit("view_log", this.pod_namespace, this.pod_name);
    },
    describeAction: function() {
      this.dialog = true;
    }
  },
  components: {
    DescribeResource
  }
};
</script>

<style>
.row-centered {
  text-align: center;
}
.min_w_h {
  min-width: 100px;
  width: fit-content;
}
</style>
