import Vue from 'vue';
import VTooltip from 'v-tooltip'
import 'v-tooltip/dist/v-tooltip.css'
import './vtooltip-my-tooltip.css'

Vue.use(VTooltip, {
  theme: 'my-tooltip',
  themes: {
    tooltip: {
      placement: 'bottom-start',
      html: false,
    },
  }
});
