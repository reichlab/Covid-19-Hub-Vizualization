<template>
  <div id="app">
    <my-header/>
    <my-viz/>
  </div>
  

</template>
<script src="../assets/analytics.js">
</script>




<script>
// import { Plotly } from 'vue-plotly'
// import embed from vega-embed
import Header from './Header'
import Viz from './Viz.vue'
export default {
  components:{
         'my-header':Header,
         'my-viz':Viz
     }
}
</script>

