<template>
  <div class="flexcontainer flex-grow-1">
    <v-app-bar tile elevate-on-scroll color="white" class="top-sticky">
      <v-toolbar-title class="pa-2">Namespaces</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-text-field clearable single-line hide-details outlined flat dense
        placeholder="filter" class="pa-2 maxwidth" @input="filterNamespace">
      </v-text-field>
      <v-btn :disabled="!changed" @click="updateItem" ripple tile color="teal lighten-1">
        Apply
      </v-btn>
    </v-app-bar>
    <div class="pl-5" id="namespace_content" v-show="status">
      <v-radio-group class="ma-1" ripple v-model="selectedNs" @change="shouldApplyChange">
        <v-radio v-for="item in filteredNamespaces" :key="item.metadata.uid" :label="item.metadata.name" :value="item.metadata.name" ripple>
        </v-radio>
      </v-radio-group>
    </div>
    <v-card v-if="!status" outlined>
      <v-card-text>{{ message }}</v-card-text>
    </v-card>
  </div>
</template>
        
<script>
import ElectronStore from 'electron-store'
const store = new ElectronStore();

import { debounce } from '../js/helpers.js'

import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  data() {
    return {
      selectedNs: null,
      changed: false,
      refresh: false,
      filter: ""
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      namespaces: 'orderedNamespaceItems',
    }),
    filteredNamespaces: function() {
      return this.namespaces.filter((val) => {
        return val.metadata.name.includes(this.filter)
      })
    }
  },
  activated() {
    this.init();
    this.filter = "";
    this.selectedNs = this.$store.getters['k8Data/getSelectedNamespace']
  },
  deactivated() {
    clearTimeout(this.timerEvent);
    this.timerEvent = null;
  },
  beforeDestroy() {
    clearTimeout(this.timerEvent);
    this.timerEvent = null;
  },
  methods: {
    init: async function() {
      return this.$store.dispatch('k8Data/fetchNamespaces').then(() => {
        this.timerEvent = setTimeout(this.init, 60000)
      });
    },
    updateItem: function() {
      this.$store.dispatch('k8Data/setSelectedNamespace', this.selectedNs)
      store.set("selected.namespace", this.selectedNs);
      this.$router.push("/pod")
    },
    filterNamespace: function(input) {
      debounce(this.filter = input ? input : "", 200, false);
    },
    shouldApplyChange: function() {
      this.changed = true;
    }
  },
};
</script>

<style scoped>
.top-sticky {
  position: sticky;
  top: 64px;
  background: white;
  z-index: 10;
  max-height: 56px;
}

.maxwidth {
  max-width: 350px;
}
</style>