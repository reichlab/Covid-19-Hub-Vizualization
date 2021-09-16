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
        <label for = "model">Add Model:</label>
      
        <b-form-select name = "model"
                      
                      :options="models_to_add"
                      @change="handle_select_model"
                      width = "70%"
                      >
        </b-form-select>
      </form>
      
      <br>
     Current Models:
      <div>
     <ul class="list-group">
       <li class="list-group-item" v-for="(item, index) in current_models" :key="index">
    	  <span class="name">{{item}}</span>
    		  <button class="btn btn-default btn-xs pull-right remove-item" @click="deleteFromList(item,index)" style="text-align: right">
          <span class="glyphicon glyphicon-remove">❌</span>
        </button>
      </li>
    </ul>
  </div>
    </div>
    
    <div id="viz" class="col-md-9">
      <client-only>
        <vue-plotly :data="plot_data" :layout="plot_layout" :style="plot_style"></vue-plotly>
      </client-only> 
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
      selected_target_variable: 'case',
      selected_location: 'US',
      selected_interval:'50%',
      selected_model:'USC-SI_kJalpha',
      plot_layout: {
        autosize: true,
        legend: {
       "orientation": "h",
        font: {
          
          size: 12,
         
        },
        
  }
      },
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
    models_to_add(){
      return this.$store.getters.models_to_add
      },
    current_models(){
      return this.$store.getters.current_models
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
    },
    handle_select_interval: function(val) {
      this.$store.commit('set_interval', val)
    },
    handle_select_model: function(val) {
      this.$store.commit('add_to_current_model', val)
      this.$store.commit('remove_from_models_to_add', val)
    },
    deleteFromList(item,index) {
      this.$store.commit('remove_from_current_model', index)
      this.$store.commit('add_to_models_to_add', item)
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

#vizualizations {
  
  padding: 1% 3%;
  border: none;
  
}

#options {
  background: #fff;
  padding: 5px;
  
}
</style>
