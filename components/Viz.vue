<template>
  <div id="vizualisation">
<div id="vizualizations" class="container-fluid">
  <div class = "row">
    <div id="options" class="col-md-3">
      <form > 
        <div class="row var" >
        <label for = "target_variable" class="col-md-5">Outcome:</label>
        <b-form-select name = "target_variable"
                       v-model="selected_target_variable"
                       :options="target_variables"
                      @change="handle_select_target_variable"
                      class="col-md-7">
        </b-form-select>
        </div>
        <div class="row var">
        <label for = "location" class="col-md-5">Location:</label>
        <b-form-select name = "location"
                       v-model="selected_location"
                       :options="locations"
                      @change="handle_select_location"
                      class="col-md-7">
        </b-form-select>
       </div>
       <div class="row var">
        <label for = "interval" class="col-md-5">Interval:</label>
        <b-form-select name = "interval"
                       v-model="selected_interval"
                       :options="intervals"
                      @change="handle_select_interval"
                      class="col-md-7">
        </b-form-select>
        </div>
      </form>

      <label for = "data">Select Truth Data:</label>
      <div class="form-group form-check select_data ">
          <input type="checkbox" :id="data1[0]" :value="data1[0]" checked @click="handle_data(data1[0],0)" >&nbsp; Current ({{current_truth}}) &nbsp;<span class="dot" style="background-color: lightgrey; "></span>&nbsp;&nbsp;&nbsp;
          <br>
          <input type="checkbox" :id="data1[1]" :value="data1[1]" checked @click="handle_data(data1[1],1)">&nbsp; As of {{truth_as_of}}&nbsp;<span class="dot" style="background-color: black;"></span>
      </div>

      {{current_models}}     
      <button type="button" class="btn btn-outline-dark btn-sm rounded-pill" style="float: right;" @click="shuffle_colours()">Shuffle Colours</button>
      <label class="label" for = "model">Select Models:</label> <input type="checkbox" id="all" :value="1" @click="select_all_models()" >
      <div v-bind:key="forecasts">
      <div id="select_model" v-bind:key="current_models">
        <div class="form-group form-check" style="min-height:0px; margin-bottom: 5px" v-for="(item, index) in models" v-bind:key="index" >
          <div v-if="forecasts.hasOwnProperty(item)" v-bind:key="forecasts">
            <div v-if="current_models.includes(item)" v-bind:key="current_models">
              <label><input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" checked>&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index]}"></span></label>
            </div>
            <div  v-else v-bind:key="current_models">
              <label><input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" >&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index]}"></span></label>
            </div>
          </div>
          <div v-else style="margin:0, padding:0">
          </div>
        </div>
        <div class="form-group form-check" style="min-height:0px; margin-bottom: 5px" v-for="(item, index) in models" v-bind:key="index+100" >
          <div v-if="!forecasts.hasOwnProperty(item)" style="color: lightgrey">
            <label><input type="checkbox" disabled="disabled">&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index]}"></span></label>
          </div>
        </div>
      </div>
      </div>
    </div>
    
    <div id="viz" class="col-md-9">
      <p class="disclaimer" > 
        <b>Most forecasts have failed to reliably predict rapid changes in the trends of reported cases and hospitalizations. Due to this limitation, they should not be relied upon for decisions about the possibility or timing of rapid changes in trends.</b>
      </p>
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
      selected_target_variable: 'death',
      selected_location: 'US',
      selected_interval:'95%',
      plot_style: {
        width: "100%",
        height:"72vh"
      
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
    current_truth(){
      return this.$store.getters.current_truth
    },
    truth_as_of(){
      return this.$store.getters.truth_as_of
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
    },
    colours(){
      return this.$store.getters.colours
    },
    all_models(){
      return this.$store.getters.all_models
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
      console.log(this.all_models)
      console.log("HI")
      if(this.all_models){
        
        this.$store.commit('select_all_models')
      }
    },
    handle_select_location: function(val) {
      this.$store.commit('set_location', val)
      console.log("HI")
      if(this.all_models){
        this.$store.commit('select_all_models')
      }
    },
    handle_select_interval: function(val) {
      this.$store.commit('set_interval', val)
    },
    shuffle_colours() {
      this.$store.commit('shuffle_colours')
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
    select_all_models(){
      var checkbox = document.getElementById("all");
      if (checkbox.checked === true)
      {
        this.$store.commit('select_all_models')
       
      }
      else{
         this.$store.commit('unselect_all_models')
         
      }
      this.$forceUpdate()
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
  width: 100% !important;
  
  margin: 0;
}
.dot {
  height: 15px;
  width: 15px;
  border-radius: 50%;
  border: 1px solid black;
  display: inline-block;
  
}
html,body{
    overflow-x: hidden !important;
}
.disclaimer{
  text-align:center; 
  margin-left: 3%; 
  margin-right: 3%; 
  font-size: 12px
}
.var{
  margin-bottom: 10px;
}
.select_data{
  font-size: 14px;
}
#vizualizations {
  
  padding: 1% 3%;
  border: none;
  
}
#select_model{
  height: 48vh; 
  overflow-y: scroll; 
  margin-top: 20px;
  font-size: 14px;

}
.label{
  margin-top: 5px;
  margin-bottom: 0px ;
}
#options {
  background: #fff;
  padding: 5px;
  
}
select{
  font-size: 14px !important;
}
label{
  font-size: 15.5px;
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

