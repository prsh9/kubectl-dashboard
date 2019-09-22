<template>
  <v-app>
    <v-app-bar app hide-on-scroll color="teal darken-2">
      <TitleBar />
    </v-app-bar>

    <!-- Sizes your content based upon application components -->
    <v-content>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <v-layout justify-center align-center>
          <DisplayPodData />
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import TitleBar from "./components/TitleBar.vue";
import DisplayPodData from "./components/DisplayPodData.vue";

export default {
  name: "App",
  data() {
    return {
      
    }
  },
  components: {
    TitleBar,
    DisplayPodData
  }
};
</script>

