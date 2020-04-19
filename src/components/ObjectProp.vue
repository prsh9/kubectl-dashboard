<template>
  <div class="object-property-content">
    <span
      class="font-italic font-weight-bold"
      :style="indentify()"
    >{{ label ? properLabel + ': ' : '' }}</span>
    <span v-if="isDataPrimitive">{{ property }}</span>
    <span v-else-if="isDataArray" :style="indentify()">
      <div v-for="(val, index) in property" :key="index" :style="arrayIndentify()">
        --
        <ObjectProp label :property="val" :indent="0"></ObjectProp>
      </div>
    </span>
    <span v-else :style="indentify(1)">
      <ObjectView :objData="property" :depth="indent + 1"></ObjectView>
    </span>
  </div>
</template>

<script>
import { capitalCase } from "capital-case";

export default {
  props: ["label", "property", "indent"],
  name: "ObjectProp",
  beforeCreate: function() {
    this.$options.components.ObjectView = require("./ObjectView.vue").default;
  },
  computed: {
    properLabel: function() {
      if (typeof this.label === "string") {
        return capitalCase(this.label);
      }
      return this.label;
    },
    isDataPrimitive: function() {
      var type_data = typeof this.property;
      if (
        type_data === "undefined" ||
        type_data === "boolean" ||
        type_data === "number" ||
        type_data === "string" ||
        type_data === "bigint" ||
        type_data === "symbol"
      ) {
        return true;
      }
      return false;
    },
    isDataArray: function() {
      return Array.isArray(this.property);
    }
  },
  methods: {
    indentify: function(val) {
      return { textIndent: (this.indent + val) * 2 + "em" };
    },
    arrayIndentify() {
      return { display: "flex" };
    }
  }
};
</script>
