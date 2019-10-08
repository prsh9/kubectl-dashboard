<template>
  <div>
    <p>IN_PROGRESS Showing Log for {{podNamespace}}.{{podname}}</p>
  </div>
</template>
        
<script>
//const kubeclient = require("kubernetes-client");
//const JSONStream = require("JSONStream");

//const client = new kubeclient.Client1_13();
//var stream = null;

export default {
  props: {
    podNamespace: {
      type: String
    },
    podname: {
      type: String
    }
  },
  data() {
    return {
      
    };
  }
};
</script>
