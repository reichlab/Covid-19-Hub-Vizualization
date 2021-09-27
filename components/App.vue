<template>

  <div id="app">
   <nav class="navbar navbar-light bg-light">
  <a class="navbar-brand" href="#">
    <img src="https://covid19forecasthub.org/images/forecast-hub-logo_DARKBLUE.png"  height="30" alt="">
  </a>
</nav>
<div id="vizualizations" class="container-fluid">
  <div class = "row">
    <div id="options" class="col-md-3">
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
        <label for = "interval">Interval:</label>
        <b-form-select name = "interval"
                       v-model="selected_interval"
                       :options="intervals"
                      @change="handle_select_interval">
        </b-form-select>
      </form>
      <br>
      <label for = "data">Select Data:</label>
      <div class="form-group form-check" v-for="(item, index) in data1" v-bind:key="index" >
        <div v-if="index ==0">
          <input type="checkbox" :id="item" :value="item" checked @click="handle_data(item,index)">&nbsp; {{item}}&nbsp;<span class="dot" style="background-color: lightgrey;"></span>
        </div>
        <div v-else>
          <input type="checkbox" :id="item" :value="item" checked @click="handle_data(item,index)">&nbsp; {{item}}&nbsp;<span class="dot" style="background-color: black;"></span>
        </div>
      </div>
      
      <label for = "model">Select Models:</label>
      <div style=" height: 150px; overflow-y: scroll;">
        <div class="form-group form-check" v-for="(item, index) in models" v-bind:key="index" >
          <div v-if="forecasts.hasOwnProperty(item)">
            <div v-if="current_models.includes(item)">
             
              <input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" checked>&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index%10]}"></span>
            </div>
            <div  v-else>
              <input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" >&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index%10]}"></span>
            </div>
          </div>
          <div v-else style="color: lightgrey">
            <input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" disabled="disabled">&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index%10]}"></span>
          </div>
        </div>
      </div>
    </div>
    
    <div id="viz" class="col-md-9">
      <client-only>
        <vue-plotly :data="plot_data" :layout="plot_layout" :style="plot_style"></vue-plotly>
      </client-only> 
      <p style="text-align:center"> 
      <small >Note: You can navigate to forecasts from previous weeks with the left and right arrow keys</small>
      </p>
    </div>
    </div>
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
      data1:['Current Truth', 'Truth As Of'],
      colours :['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
      selected_target_variable: 'case',
      selected_location: 'US',
      selected_interval:'95%',
      plot_style: {
        width: "100%",
        height:"80vh"
      
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
    intervals () {
      return this.$store.getters.intervals
    },
    models(){
    return this.$store.getters.models
    },
    current_models(){
    return this.$store.getters.current_models
    },
    forecasts(){
      return this.$store.getters.forecasts
      },
    plot_data () {
      return this.$store.getters.plot_data
    },
    plot_layout(){
      return this.$store.getters.plot_layout
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
    },
    handle_select_interval: function(val) {
      this.$store.commit('set_interval', val)
    },
    handle_models(item,index) {
      var checkbox = document.getElementById(item);
      if (checkbox.checked != true)
      {
        this.$store.commit('remove_from_current_model', item)
      }
      else{
         this.$store.commit('add_to_current_model', item)
      }
      
    },
    handle_data(item,index) {
      var checkbox = document.getElementById(item);
      if (checkbox.checked != true)
      {
        this.$store.commit('remove_from_data', item)
      }
      else{
         this.$store.commit('add_to_data', item)
      }
      
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
  
  margin: 0;
}
.dot {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  border: 1px solid black;
  display: inline-block;
  
}

#vizualizations {
  
  padding: 1% 3%;
  border: none;
  
}

#options {
  background: #fff;
  padding: 5px;
  
}
/* width */
::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  box-shadow: inset 0 0 5px grey; 
  border-radius: 10px;
}
 
/* Handle */
::-webkit-scrollbar-thumb {
  background: grey; 
  border-radius: 5px;
}
</style>
