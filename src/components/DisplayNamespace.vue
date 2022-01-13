<template>
  <div class="flexcontainer flex-grow-1">
    <v-card tile flat>
      <v-card-title class="pa-2">Namespaces</v-card-title>
    </v-card>
    <div class="pl-5" id="namespace_content" v-show="status">
      <v-radio-group class="ma-1" ripple v-model="selectedNs" @change="shouldApplyChange">
        <v-radio v-for="item in namespaces" :key="item.metadata.uid" :label="item.metadata.name" :value="item.metadata.name" ripple>
        </v-radio>
      </v-radio-group>
    </div>
    <v-card v-if="!status" outlined>
      <v-card-text>{{ message }}</v-card-text>
    </v-card>
    <v-footer inset app tile color="white" elevation="4" class="pa-4">
      <v-btn :disabled="!changed" @click="updateItem" ripple tile color="teal lighten-1">
        Apply
      </v-btn>
    </v-footer>
  </div>
</template>
        
<script>
import { createNamespacedHelpers } from 'vuex'

const { mapGetters } = createNamespacedHelpers('k8Data')

export default {
  data() {
    return {
      selectedNs: null,
      changed: false,
      refresh: false
    };
  },
  computed: {
    ...mapGetters({
      message: 'getMessage',
      status: 'getStatus',
      namespaces: 'orderedNamespaceItems',
    }),
  },
  activated() {
    this.init();
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
      this.$store.commit('k8Data/setSelectedNamespace', this.selectedNs)
    },
    shouldApplyChange: function() {
      this.changed = true;
    }
  },
};
</script>
