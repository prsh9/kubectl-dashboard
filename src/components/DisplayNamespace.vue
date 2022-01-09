<template>
  <div class="flexcontainer flex-grow-1">
    <h2>Namespaces</h2>
    <div class="flex-grow-1 border">
      <v-radio-group ripple v-model="selectedNs" @change="shouldApplyChange">
        <v-radio v-for="item in namespaces" :key="item.metadata.uid" :label="item.metadata.name" :value="item.metadata.name" ripple>
        </v-radio>
      </v-radio-group>
      <!-- <v-list nav dense>
        <v-list-item-group>
          <v-list-item v-for="item in namespaces" :key="item.uid" @click="updateItem">
            <v-list-item-content>
              {{ item }}
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list> -->
      <v-btn :disabled="!changed" @click="updateItem" ripple tile outlined>
        Apply
      </v-btn>
    </div>
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
  mounted() {
    console.log("called")
    this.init();
  },
  activated() {
    console.log("activated")
    this.timerEvent = setTimeout(this.init, 5000)
  },
  deactivated() {
    console.log("deactivated")
    clearTimeout(this.timerEvent);
  },
  methods: {
    init: async function() {
      console.log("Init")
      return this.$store.dispatch('k8Data/fetchNamespaces').then(() => {
        this.selectedNs = this.$store.getters['k8Data/getSelectedNamespace']
      })
    },
    updateItem: function() {
      console.log("clicked")
      this.$store.commit('k8Data/setSelectedNamespace', this.selectedNs)
    },
    shouldApplyChange: function() {
      this.changed = true;
    }
  },
};
</script>
