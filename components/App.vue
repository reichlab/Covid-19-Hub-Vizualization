<template>
  <div id="app">
    <my-header/>
    <forecastViz/>
  </div>
</template>

<script src="../assets/analytics.js">
</script>

<script>
// import { Plotly } from 'vue-plotly'
// import embed from vega-embed
import Header from './Header'
export default {
  components: {
    'my-header':Header
  }
}
</script>

