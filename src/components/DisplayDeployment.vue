<template>
  <div id="k8_pod_parent">
    <v-card tile flat>
      <v-card-title class="pa-2">Deployments in '{{ selectedNamespace }}' namespace</v-card-title>
    </v-card>
    <div id="deployment_content" v-show="status">
      <div class="d-flex">
        <v-spacer></v-spacer>
        <v-text-field 
          v-model="search" 
          placeholder="Search" 
          single-line 
          hide-details 
          clearable
          outlined
          dense
          flat
          prepend-inner-icon="mdi-magnify"
          class="pa-2 maxwidth"
        ></v-text-field>
      </div>
      <v-data-table 
        dense
        fixed-header
        :headers="deploymentHeaders"
        :items="computedItems"
        class="elevation-1"
        item-key="id"
        disable-pagination
        disable-sort
        show-expand
        single-expand
        single-select
        hide-default-footer
        :search="search"
        @click:row="(_item, slot) => slot.expand(!slot.isExpanded)"
      >
        <template v-slot:expanded-item="{ headers, item }">
          <td :colspan="headers.length">
            More info about {{ item.name }}
          </td>
        </template>
        // eslint-disable-next-line
        <template v-slot:item.readyReplicas="{ value, item }">
          <v-chip pill small :color="determineReadinessColor(value, item.replicas) + ' lighten-3'">
            {{value}} / {{item.replicas}}
          </v-chip>
        </template>
        <template v-slot:item.containerImages="{ value }">
          <v-text-field v-if="value.length == 1"
            readonly
            flat
            dense
            solo
            hide-details
            :value="value[0].image"
          >
          </v-text-field>
        </template>
        <template v-slot:item.age="{ value }">
          <div v-tooltip="{ content: value.age_full }">{{ value.age_short }}</div>
        </template>
      </v-data-table>    
    </div>
    <v-card v-if="!status" outlined class="flexcontainer flex-grow-1 justify-center">
      <v-card-text>{{ message }}</v-card-text>
    </v-card>
  </div>
</template>
        
<script>
import { createNamespacedHelpers } from 'vuex'
import { shortEnglishHumanizer } from '../js/date_helpers'
const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  data() {
    return {
      deploymentHeaders: [
        {
          text: 'Name',
          value: 'name'
        },
        {
          text: 'Replicas',
          value: 'readyReplicas',
          filterable: false,
          sortable: false
        },
        {
          text: 'Up to Date Replicas',
          value: 'updatedReplicas',
          filterable: false,
          sortable: false
        },
        {
          text: 'Available Replicas',
          value: 'availableReplicas',
          filterable: false,
          sortable: false
        },
        {
          text: 'Image',
          value: 'containerImages',
          filterable: false,
          sortable: false,
        },
        {
          text: 'Age',
          value: 'age',
          filterable: false,
          sortable: false
        },
        { text: '', value: 'data-table-expand' },
      ],
      selected: null,
      expanded: null,
      search: null,
      refresh: false,
      timeoutInstance: null
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      deploymentItems: 'orderedDeploymentItems',
      selectedNamespace: 'getSelectedNamespace'
    }),
    computedItems: function() {
      var computedItems = []
      for(const item of this.deploymentItems) {
        computedItems.push({
          id: item.metadata.uid, 
          name: item.metadata.name,
          replicas: item.status.replicas || 0,
          updatedReplicas: item.status.updatedReplicas || 0,
          readyReplicas: item.status.readyReplicas || 0,
          availableReplicas: item.status.availableReplicas || 0,
          age: { 
            age_short: this.computeAge(item), 
            age_full: this.extractCreationDate(item)
          },
          containerImages: this.extractContainerImages(item)
        });
      }
      return computedItems;
    } 
  },
  activated() {
    this.init();
  },
  deactivated() {
    clearInterval(this.timeoutInstance)
    this.timeoutInstance = null;
  },
  beforeDestroy() {
    clearInterval(this.timeoutInstance)
    this.timeoutInstance = null;
  },
  methods: {
    extractCreationDate: function(item) {
      return new Date(item.metadata.creationTimestamp).toString();
    },
    computeAge: function(item) {
      return shortEnglishHumanizer(Date.now() - Date.parse(item.metadata.creationTimestamp), { spacer: "", largest: 2, round: true, delimiter: "", serialComma: false });
    },
    extractContainerImages: function(item) {
      var conatinerImages = [];
      item.spec.template.spec.containers.forEach(element => {
        conatinerImages.push({
          name: element.name,
          image: element.image
        });
      })
      return conatinerImages;
    },
    init: async function() {
      // await this.$store.dispatch('k8Data/stopPodWatch').then(() => {
          return this.$store.dispatch('k8Data/fetchDeploymentData')
      //   }).then(() => {
      //     return this.$store.dispatch('k8Data/watchPodData');
      //   },
      //   (rej) => {
      //     console.log("Error" + rej);
      //   }
      // ).finally(() => {
      //   this.startRefresher();
      // });
    },
    startRefresher: function() {
      // this.timeoutInstance = setTimeout(this.init, 60000);
    },
    determineReadinessColor: function(ready, total) {
      if(ready == total) {
        if(ready == 0) {
          return "blue";
        }
        return "green";
      }
      else if(ready > 0) {
        return "orange"
      }
      return "red";
    },
  },
  components: {
  }
};
</script>

<style>
.row-head-centered {
  text-align: center;
}
.selected {
  background: lightgrey
}

.maxwidth {
  max-width: 350px;
}

</style>