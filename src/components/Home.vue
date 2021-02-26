<template>
  <div>
    <v-tabs fixed-tabs v-model="tab">
      <v-tab>Pod Info</v-tab>
      <v-tab>Svc Info</v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <v-tab-item>
        <DisplayPodData />
      </v-tab-item>
      <v-tab-item>
        <DisplaySvcData />
      </v-tab-item>
    </v-tabs-items>
  </div>
</template>

<script>
import DisplayPodData from "./DisplayPodData.vue";
import DisplaySvcData from "./DisplaySvcData.vue";

export default {
  name: "Home",
  data() {
    return {
      tab: null,
    };
  },
  created() {
  },
  methods: {
  },
  components: {
    DisplayPodData,
    DisplaySvcData
  }
};
</script>
