<template>
  <div class="object-content">
    <ObjectProp
      v-for="(val, label, index) in objData"
      :key="index + label"
      :label="label"
      :property="val"
      :indent="depth"
    ></ObjectProp>
  </div>
</template>

<script>
import ObjectProp from "./ObjectProp.vue";

export default {
  props: {
    objData: {
      type: [Object, Array]
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  name: "ObjectView",
  methods: {},
  components: {
    ObjectProp
  }
};
</script>