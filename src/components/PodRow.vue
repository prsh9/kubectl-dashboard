<template>
  <tr @click="selectedRow">
    <td class="name_css">{{ pod_name }}</td>
    <td class="minimal_pad">
      <div class="min_w_h">
        <v-progress-linear
          :stream="pod_status_actual != 'Failed'"
          :color="pod_status_color + ' lighten-3'"
          height="20px"
          :buffer-value="ready_container_percent"
          :value="ready_container_percent"
          reverse
        >
          <v-spacer></v-spacer>
          {{ num_ready_containers }}/{{ num_comtainers }}
          <v-spacer></v-spacer>
        </v-progress-linear>
        <v-avatar
          right
          tile
          absolute
          :color="container_restarts > 0 ? (container_restarts > 1 ? 'red accent-1' : 'orange lighten-3' ) : 'teal lighten-4'"
          size="20"
        >
          <span class="white--text">{{container_restarts}}</span>
        </v-avatar>
      </div>
    </td>
    <td class="status_css minimal_pad">
      <v-chip outlined ripple :color="pod_status_color">{{ pod_status_message }}</v-chip>
    </td>
    <td>{{ pod_pod_ip }}</td>
    <td v-tooltip="{ content: this.pod_age_full }">{{ pod_age }}</td>
    <td>
      <v-menu left offset-y open-on-click>
        <template v-slot:activator="{ on }">
          <v-icon v-on="on" class="OCMen">mdi-menu</v-icon>
        </template>
        <v-list dense>
          <v-list-item v-for="(item, index) in actions" :key="index" @click="item.action()">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-dialog scrollable persistent v-model="describeDialog">
        <!-- v-if is necessary to mount every time dialog is opened -->
        <DescribeResource
          v-if="describeDialog"
          resourceType="pod"
          :resourceUID="row.metadata.uid"
          @close="describeDialog = false"
        ></DescribeResource>
      </v-dialog>
      <v-dialog v-model="shellSelection" max-width="400px">
        <!-- v-if is necessary to mount every time dialog is opened -->
        <v-card v-if="shellSelection" flat>
          <v-card-title>Enter Shell To Use</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-text-field clearable v-model="shellSelectionText" autofocus @focus="$event.target.select()" @keyup.enter="openConsoleUsing" />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="teal darken-2" text @click="openConsoleUsing">Ok</v-btn>
            <v-btn color="teal darken-2" text @click="shellSelection = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </td>
  </tr>
</template>

<script>
import DescribeResource from "./DescribeResource.vue";
import { shortEnglishHumanizer } from '../js/date_helpers';
import { extractContainterNames, ConsoleData, LogData } from '../js/k8_data_helpers';

export default {
  props: {
    row: {
      type: Object
    }
  },
  data() {
    return {
      describeDialog: false,
      shellSelection: false,
      shellSelectionText: "bash",
      actions: [
        {
          title: "Open Console",
          action: this.openConsoleAction
        },
        {
          title: "View Logs",
          action: this.viewLogsAction
        },
        {
          title: "Describe",
          action: this.describeAction
        },
        {
          title: "Delete",
          action: this.deleteAction
        }
      ]
    };
  },
  computed: {
    pod_uid: function() {
      return this.row.metadata.uid;
    },
    pod_name: function() {
      return this.row.metadata.name;
    },
    pod_age_full: function() {
      return new Date(this.row.status.startTime).toString();
    },
    pod_age: function() {
      return shortEnglishHumanizer(Date.now() - Date.parse(this.row.status.startTime), { spacer: "", largest: 2, round: true, delimiter: "", serialComma: false });
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
      this.$store.dispatch("k8Data/deletePod", this.row.metadata.uid);
    },
    viewLogsAction: function() {
      var containters = extractContainterNames(this.row);
      var logData = new LogData(this.row.metadata.uid, this.pod_name, this.pod_namespace, containters.container, containters.initContainer);
      this.$store.dispatch("openLogs/addOpenTab", { uid: this.row.metadata.uid, data: logData });
      this.$router.push("/log?select=-1")
    },
    describeAction: function() {
      this.describeDialog = true;
    },
    openConsoleAction: function() {
      this.shellSelection = true;
    },
    openConsoleUsing: function() {
      this.shellSelection = false;
      var consoleData = new ConsoleData(this.row.metadata.uid, this.pod_name, this.pod_namespace, this.shellSelectionText);
      this.$store.dispatch("openConsoles/addOpenTab", { uid: this.row.metadata.uid, data: consoleData });
      this.$router.push("/console?select=-1");
    },
    selectedRow: function() {
      this.$emit("selected", this.pod_uid);
    }
  },
  components: {
    DescribeResource
  }
};
</script>

<style>
.name_css {
  max-width: 40vw;
}
.status_css {
  text-align: center;
  min-width: 150px;
}
.minimal_pad {
  padding: 1px;
}
.min_w_h {
  min-width: 130px;
  width: 100%;
  display: flex;
  flex-direction: row;
}
</style>
