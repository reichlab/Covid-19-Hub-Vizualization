<template>
  <div id="app">
   <header id="masthead" class="site-header outer">
   <div class="inner">
      <div class="site-header-inside">
         <div class="site-branding">
            <p class="site-logo"><a href="https://covid19forecasthub.org"><img src="https://covid19forecasthub.org/images/forecast-hub-logo_DARKBLUE.png" alt="Viz - COVID-19 Forecast Hub"/></a></p>
         </div>
         <!-- .site-branding -->
         <nav id="main-navigation" class="site-navigation" aria-label="Main Navigation">
            <div class="site-nav-inside">
               <button id="menu-close" class="menu-toggle"><span class="screen-reader-text">Open Menu</span><span class="icon-close" aria-hidden="true"></span></button>
               <ul class="menu">
                  <li class="menu-item current">
                     <a class="" href="https://covid19forecasthub.org">
                     Home
                     </a>
                  </li>
                   <li class="menu-item">
                     <a class="" href="https://covid-19-hub-vizualization.netlify.app/">
                     Visualization
                     </a>
                  </li>
                   <li class="menu-item">
                     <a class="" href="https://covid19forecasthub.org/doc/reports/">
                     Reports
                     </a>
                  </li>
                  <li class="menu-item">
                     <a class="" href="https://covid19forecasthub.org/data/">
                     Data
                     </a>
                  </li>
                  <li class="menu-item">
                     <a class="" href="https://covid19forecasthub.org/community/">
                     Community
                     </a>
                  </li>
                  <li class="menu-item">
                     <a class="" href="https://covid19forecasthub.org/doc/">
                     About
                     </a>
                  </li>
                  <li class="menu-item menu-button">
                     <a class="button" href="https://github.com/reichlab/covid19-forecast-hub" target="_blank" rel="noopener">GitHub</a>          
                  </li>
               </ul>
            </div>
            <!-- .site-nav-inside -->
         </nav>
         <!-- .site-navigation -->
      </div>
      <!-- .site-header-inside -->
   </div>
   <!-- .inner -->
</header>
<!-- .site-header -->
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
      <button type="button" class="btn btn-outline-dark btn-sm rounded-pill" style="float: right;" @click="shuffle_colours()">Shuffle Colours</button>
      <label class="label" for = "model">Select Models:</label> <input type="checkbox" id="all" :value="1" @click="select_all_models()" >
      <div id="select_model" v-bind:key="current_models">
        <div class="form-group form-check" style="min-height:0px; margin-bottom: 5px" v-for="(item, index) in models" v-bind:key="item" >
          <div v-if="forecasts.hasOwnProperty(item)">
            <div v-if="current_models.includes(item)">
              <label><input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" checked>&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index]}"></span></label>
            </div>
            <div  v-else>
              <label><input type="checkbox" :id="item" :value="item" @click="handle_models(item,index)" >&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index]}"></span></label>
            </div>
          </div>
          <div v-else style="margin:0, padding:0">
          </div>
        </div>
        <div class="form-group form-check" style="min-height:0px; margin-bottom: 5px" v-for="(item, index) in models" v-bind:key="item" >
          <div v-if="!forecasts.hasOwnProperty(item)" style="color: lightgrey">
            <label><input type="checkbox" disabled="disabled">&nbsp; {{item}}&nbsp;<span class="dot" v-bind:style="{ backgroundColor: colours[index]}"></span></label>
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
  
<!-- End of Statcounter Code -->
</template>
<!-- Default Statcounter code for Covid19-forecast-hub
https://viz.covid19forecasthub.org -->
<script type="text/javascript">
var sc_project=12239903; 
var sc_invisible=1; 
var sc_security="3c7ad044"; 
</script>
<script type="text/javascript"
src="https://www.statcounter.com/counter/counter.js"
async></script>
<!-- End of Statcounter Code -->
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
        height:"70vh"
      
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
  height: 370px; 
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

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css?family=Open+Sans:800');
@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:700');
/// Removes a specific item from a list.
/// @author Hugo Giraudel
/// @param {list} $list List.
/// @param {integer} $index Index.
/// @return {list} Updated list.
@function remove-nth($list, $index) {
  $result: null;
  @if type-of($index) != number {
    @warn "$index: #{quote($index)} is not a number for `remove-nth`.";
  }
  @else if $index == 0 {
    @warn "List index 0 must be a non-zero integer for `remove-nth`.";
  }
  @else if abs($index) > length($list) {
    @warn "List index is #{$index} but list is only #{length($list)} item long for `remove-nth`.";
  }
  @else {
    $result: ();
    $index: if($index < 0, length($list) + $index + 1, $index);
    @for $i from 1 through length($list) {
      @if $i != $index {
        $result: append($result, nth($list, $i));
      }
    }
  }
  @return $result;
}
/// Gets a value from a map.
/// @author Hugo Giraudel
/// @param {map} $map Map.
/// @param {string} $keys Key(s).
/// @return {string} Value.
@function val($map, $keys...) {
  @if nth($keys, 1) == null {
    $keys: remove-nth($keys, 1);
  }
  @each $key in $keys {
    $map: map-get($map, $key);
  }
  @return $map;
}
/// Gets a font value.
/// @param {string} $keys Key(s).
/// @return {string} Value.
@function _font($keys...) {
  @return val($font, $keys...);
}
/// Gets a palette value.
/// @param {string} $keys Key(s).
/// @return {string} Value.
@function _palette($keys...) {
  @return val($palette, $keys...);
}
$font: (
  primary: ("Lato", Helvetica, Arial, sans-serif),
  monospace: (Monaco, courier, monospace)
);
// Palette.
$palette: (
  primary:           #424b5f,
  secondary:         #283040,
  meta:              #67758d,
  border:            #dee5ef,
  bg:                #f7f9fb,
  note:              #fcb41d,
  important:         #fc381d,
  accent:            #004e92,
  accent-alt:        #000428,
);
/**
 * Site Header
 */
.site-header {
  background: #fff;
  padding-bottom: 1.25em;
  padding-top: 1.125em;
  padding-left: 3vw;
  padding-right: 3vw;
  align-self: center;
}
.site-header-inside {
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}
.button {
  font-family: "Lato", Helvetica, Arial, sans-serif;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
-webkit-box-direction: normal;
list-style: none;
background-color: #004e92;
border: 2px solid #004e92;
border-radius: 1.75em;
box-sizing: border-box;
color: #fff;
display: inline-block;
font-size: 14px;
font-weight: bold;
letter-spacing: 0.035em;
line-height: 1.2;
text-align: center;
text-decoration: none;
transition: .3s ease;
vertical-align: middle;
padding-bottom: 0.5em;
padding-top: 0.5em;
padding-left: 1.25em;
padding-right: 1.25em;
}
.button:hover {
  font-family: "Lato", Helvetica, Arial, sans-serif;
text-rendering: optimizeLegibility;
-webkit-font-smoothing: antialiased;
-webkit-box-direction: normal;
list-style: none;
border: 2px solid #004e92;
border-radius: 1.75em;
box-sizing: border-box;
display: inline-block;
font-size: 14px;
font-weight: bold;
letter-spacing: 0.035em;
line-height: 1.2;
text-align: center;
text-decoration: none;
transition: .3s ease;
vertical-align: middle;
padding-bottom: 0.5em;
padding-top: 0.5em;
background-color: transparent;
color: #004e92;
outline: 0;
padding-left: 1.25em;
padding-right: 1.25em;
}
.inner {
      margin-left: auto;
    margin-right: auto;
    max-width: 1200px;
}
.site-branding {
  -webkit-box-flex: 0;
  -ms-flex: 0 1 auto;
  flex: 0 1 auto;
  a {
    border: 0;
    color: inherit;
    display: inline-block;
  }
}
.site-title {
  color: _palette(secondary);
  font-size: 1.75rem;
  font-weight: bold;
  line-height: 1.2;
  margin: 0;
}
.site-logo {
  margin: 0;
  img {
    max-height: 55px;
  }
}
.site-navigation {
  margin-left: auto;
  a:hover {
  text-decoration: none;
}
}
.menu,
.submenu {
  list-style: none;
  margin: 0;
  padding: 0;
}
.menu-item {
  position: relative;
  &.current-menu-item {
    color: _palette(accent);
  }
  a {
    &:not(.button) {
      border: 0;
      color: inherit;
      display: inline-block;
      font-size: 14px;
      line-height: 1.5;
      &:hover {
        color: _palette(accent);
      }
    }
  }
}
.menu-toggle {
  display: none;
}
@media only screen and (min-width: 801px) {
  .menu {
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }
  .menu-item {
    margin-left: 20px;
    padding-bottom: 0.1875em;
    padding-top: 0.1875em;
    a {
      padding-bottom: 0.5em;
      padding-top: 0.5em;
      &.button:not(.button-icon) {
        padding-left: 1.25em;
        padding-right: 1.25em;
      }
    }
    &.has-children > a {
      padding-right: 15px;
      position: relative;
      &:after {
        background: 0;
        border-color: currentColor;
        border-style: solid;
        border-width: 1px 1px 0 0;
        box-sizing: border-box;
        content: "";
        height: 6px;
        position: absolute;
        right: 0;
        top: 50%;
        width: 6px;
        -webkit-transform: translateY(-50%) rotate(135deg);
        transform: translateY(-50%) rotate(135deg);
      }
      &.button:not(.button-icon) {
        padding-right: 2.25em;
        &:after {
          right: 1.25em;
        }
      }
    }
  }
  .submenu {
    background: #fff;
    border: 1px solid _palette(border);
    border-radius: 3px;
    left: 0;
    min-width: 180px;
    opacity: 0;
    padding: 0.75em 0;
    position: absolute;
    text-align: left;
    top: 100%;
    -webkit-transition: opacity .2s, visibility 0s .2s;
    transition: opacity .2s, visibility 0s .2s;
    visibility: hidden;
    width: 100%;
    z-index: 99;
  }
  .menu-item {
    .submenu-toggle {
      display: none;
    }
    &.has-children:hover > .submenu {
      opacity: 1;
      -webkit-transition: margin .3s, opacity .2s;
      transition: margin .3s, opacity .2s;
      visibility: visible;
    }
  }
  .submenu {
    .menu-item {
      display: block;
      margin: 0;
      padding: 0 15px;
    }
    a {
      &:not(.button-icon) {
        display: block;
      }
      &.button:not(.button-icon) {
        margin: 0.5em 0;
      }
    }
  }
}
@media only screen and (max-width: 800px) {
  .site {
    overflow: hidden;
    position: relative;
  }
  .site-branding {
    margin-right: 10px;
  }
  .site-header {
    &:after {
      background: rgba(_palette(primary),.6);
      content: "";
      height: 100vh;
      left: 0;
      opacity: 0;
      position: absolute;
      top: 0;
      -webkit-transition: opacity .15s ease-in-out,visibility 0s ease-in-out .15s;
      transition: opacity .15s ease-in-out,visibility 0s ease-in-out .15s;
      visibility: hidden;
      width: 100%;
      z-index: 998;
    }
  }
  #menu-open {
    display: block;
    margin-left: auto;
  }
  .site-navigation {
    background: #fff;
    box-sizing: border-box;
    height: 100vh;
    margin: 0;
    max-width: 360px;
    -webkit-overflow-scrolling: touch;
    position: absolute;
    right: -100%;
    top: 0;
    -webkit-transition: right .3s ease-in-out, visibility 0s .3s ease-in-out;
    transition: right .3s ease-in-out, visibility 0s .3s ease-in-out;
    visibility: hidden;
    width: 100%;
    z-index: 999;
  }
  .site-nav-inside {
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    position: relative;
  }
  .menu--opened {
    .site {
      height: 100%;
      left: 0;
      overflow: hidden;
      position: fixed;
      top: 0;
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      width: 100%;
      z-index: 997;
    }
    .site-navigation {
      right: 0;
      -webkit-transition: right .3s ease-in-out;
      transition: right .3s ease-in-out;
      visibility: visible;
    }
    .site-header:after {
      opacity: 1;
      -webkit-transition-delay: 0s;
      transition-delay: 0s;
      visibility: visible;
    }
  }
  #menu-close {
    display: block;
    position: absolute;
    right: 3vw;
    top: 1.125rem;
  }
  .menu {
    padding: 4.5rem 3vw 3rem;
  }
  .submenu {
    border-top: 1px solid _palette(border);
    display: none;
    padding-left: 15px;
  
    &.active {
      display: block;
    }
  }
  .menu-item {
    border-top: 1px solid _palette(border);
    display: block;
    margin: 0;
    &:not(.menu-button):last-child {
      border-bottom: 1px solid _palette(border);
    }
    a {
      &:not(.button),
      &.button-icon {
        padding: 1em 0;
      }
      &:not(.button-icon) {
        display: block;
      }
    }
    &.has-children > a {
      margin-right: 30px;
    }
    .menu-item {
      &:first-child {
        border-top: 0;
      }
      &:last-child {
        border-bottom: 0;
      }
    }
    .submenu-toggle {
      background: 0;
      border: 0;
      border-radius: 0;
      color: _palette(meta);
      display: block;
      height: 48px;
      padding: 0;
      position: absolute;
      right: 0;
      top: 0;
      width: 30px;
  
      &.active .icon-angle-right {
        -webkit-transform: rotate(135deg);
        transform: rotate(135deg);
      }
    }
  }
  .menu-button {
    & > .button:not(.button-icon) {
      margin-bottom: 1em;
      margin-top: 1em;
    }
 
    & + .menu-button {
      border-top: 0;
    }
  }
}

</style>