<template>
  <tr>
    <td class="minimal_pad">{{ svc_namespace }}</td>
    <td>{{ svc_name }}</td>
    <td>{{ svc_type }}</td>
    <td>{{ svc_cluster_ip }}</td>
    <td>
      <table>
        <tr v-for="(row,index) in svc_ports" :key="index" :class="{ makeLink: row.hasLink }" @click="open(row.link)">{{row.data }}</tr>
      </table>
    </td>
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
          resourceType="svc"
          :resourceUID="row.metadata.uid"
          @close="dialog = false"
        ></DescribeResource>
      </v-dialog>
    </td>
  </tr>
</template>

<script>
import DescribeResource from "./DescribeResource.vue";
import { shell } from 'electron'

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
        }
      ]
    };
  },
  computed: {
    svc_name: function() {
      return this.row.metadata.name;
    },
    svc_namespace: function() {
      return this.row.metadata.namespace;
    },
    svc_type: function() {
      return this.row.spec.type;
    },
    svc_cluster_ip: function() {
      return this.row.spec.clusterIP;
    },
    svc_ports: function() {
      var port_details = this.row.spec.ports.reduce((port_arr, portInfo) => {
        var port_str = portInfo.port.toString();
        var link = "";
        var hasLink = false;
        if (portInfo.nodePort) {
          port_str = port_str.concat(":").concat(portInfo.nodePort);
          link = "http://localhost:" + portInfo.nodePort;
          hasLink = true;
        }
        port_str = port_str.concat("/").concat(portInfo.protocol);
        port_arr.push({ data: port_str, hasLink: hasLink, link: link });
        return port_arr;
      }, []);
      return port_details;
    }
  },
  methods: {
    open: function(link) {
      shell.openExternal(link);
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

<style scoped>
.status_css {
  text-align: center;
  min-width: 150px;
}
.minimal_pad {
  padding: 1px;
}
.makeLink {
  text-decoration: underline;
  color: #2574ce;
}
.makeLink:hover {
  cursor: pointer;
  text-shadow: 1px;
}
</style>
