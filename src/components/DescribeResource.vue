<template>
  <v-card>
    <v-card-title class="headline text-capitalize">Describe {{ resourceType }} {{ resourceName }}</v-card-title>
    <v-divider></v-divider>
    <v-card-text class="overflow-auto text-no-wrap">
      <v-progress-circular indeterminate v-if="loading"></v-progress-circular>
      <TreeView v-else :data="resourceData" max-depth="100"></TreeView>
    </v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-btn color="teal darken-2" text @click="loadData">Refresh</v-btn>
      <v-spacer></v-spacer>
      <v-btn color="teal darken-2" text @click="$emit('close')">Close</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import TreeView from "./TreeView.vue";
import { capitalCase } from 'capital-case';

export default {
  props: {
    resourceType: {
      type: String
    },
    resourceUID: {
      type: String
    }
  },
  data() {
    return {
      resourceData: {},
      loading: true
    };
  },
  computed: {
    resourceName: function() {
      if (this.resourceData.metadata) {
        return this.resourceData.metadata.name;
      }
      return "";
    }
  },
  mounted() {
    this.loadData();
  },
  methods: {
    loadData: function() {
      this.resourceData = this.$store.getters['podData/get' + capitalCase(this.resourceType) + 'Data'](this.resourceUID);
      this.loading = false;
    }
  },
  components: {
    TreeView
  }
};
</script>