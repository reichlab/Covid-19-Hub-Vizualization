<template>
  <div id="app">
    <div id="options">
      <form>
        <label for = "target_variable">Target Variable:</label>
        <b-form-select name = "target_variable"
                       v-model="selected_target_variable"
                       :options="target_variables"
                      @change="handle_select_target_variable">
        </b-form-select>
        <label for = "location">Location:</label>
        <b-form-select name = "location"
                       v-model="selected_location"
                       :options="locations"
                      @change="handle_select_location">
        </b-form-select>
      </form>
    </div>
    
    <div id="viz">
      <client-only>
        <vue-plotly :data="plot_data" :layout="plot_layout" :style="plot_style"></vue-plotly>
      </client-only>
    </div>
  </div>
</template>

<script>
// import { Plotly } from 'vue-plotly'
// import embed from vega-embed

export default {
  // components: {
  //   Plotly
  // },
  data() {
    return {
      selected_target_variable: 'case',
      selected_location: 'US',
      plot_layout: {
        autosize: true
      },
      plot_style: {
        width: "100%",
        height: "100%"
      }
    }
  },
  computed: {
    target_variables () {
      return this.$store.getters.target_variables
    },
    locations () {
      return this.$store.getters.locations
    },
    plot_data () {
      return this.$store.getters.plot_data
    }
  },
  methods: {
    keydown_handler: function(event) {
      console.log(event.keyCode)
      if (event.keyCode == 37) {
        this.$store.commit('decrement_as_of')
      } else if (event.keyCode == 39) {
        this.$store.commit('increment_as_of')
      }
    },
    handle_select_target_variable: function(val) {
      this.$store.commit('set_target_var', val)
    },
    handle_select_location: function(val) {
      this.$store.commit('set_location', val)
    }
  },
  mounted() {
    window.addEventListener('keydown', this.keydown_handler);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.keydown_handler);
  }
}
</script>

<style>
html,
body,
#__nuxt,
#__layout,
#__layout > div,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

#app {
  display: grid;
  grid-template-columns: 30% 70%;
}

#options {
  height: 100%;
  background: #fff;
  padding: 5px;
  border-right: 2px solid rgba(0, 0, 0, 0.2);
}
</style>
