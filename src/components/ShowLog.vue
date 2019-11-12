<template>
  <div>
    <h3>
      Logs for
      <b>{{podNamespace}}.{{podName}}</b>
    </h3>
    
    <v-card class="overflow-y-hidden">
      <pre class="text-wrap" v-for="(text, index) in logdata" :key="index">{{text}}</pre>
    </v-card>

    <!-- <v-textarea ref="log_area" dense rows="45" no-resize readonly type="log" solo outlined :value="logdata.join('')" full-width></v-textarea> -->
  </div>
</template>
        
<script>
let stream = null;

export default {
  props: {
    podNamespace: {
      type: String
    },
    podName: {
      type: String
    }
  },
  data() {
    return {
      logdata: []
    };
  },
  mounted() {
    this.startLogging();
  },
  beforeDestroy() {
    this.stopLogging();
  },
  methods: {
    startLogging: async function() {
      const kubeclient = require("kubernetes-client");
      const client = new kubeclient.Client1_13();

      var pod_details = await client.api.v1.namespaces(this.podNamespace).pods(this.podName).get();
      var container_name = pod_details.body.spec.containers[0].name;
      
      stream = await client.api.v1
        .namespaces(this.podNamespace)
        .pods(this.podName)
        .log.getByteStream({
          qs: {
            container: container_name,      
            tailLines: 10,
            follow: true
          }
        });

      stream.on("data", object => {
        // console.log('Log event:', JSON.stringify(object.toString(), null, 2));
        if(this.logdata.length > 10000) {
          this.logdata.splice(0, 500);
        }
        this.logdata.push(object);
        
      });
    },
    stopLogging: function() {
      if (stream != null) {
        stream.abort();
        stream = null;
      }
      this.logdata = "";
    }
  }
};
</script>