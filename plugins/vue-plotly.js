import Vue from 'vue';
import { Plotly } from 'vue-plotly';

const VuePlotly = {
  install(Vue) {
    Vue.component('vue-plotly', Plotly);
  },
};
Vue.use(VuePlotly);
export default VuePlotly;

// if (process.client) {
//     Vue.use(Plotly)
// }
