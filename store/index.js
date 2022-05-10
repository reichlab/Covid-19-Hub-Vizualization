// store/index.js
import moment from 'moment';
import axios from 'axios';
import target_variables from '../assets/target_variables.json';
import locations from '../assets/locations.json';
import available_as_ofs from '../static/data/available_as_ofs.json';
import models from '../static/data/models.json';

let date = available_as_ofs.death[available_as_ofs.death.length - 1]
while(true){
  try {
    let fileName = require(`../static/data/forecasts/case_01_${date}`);
    break
  } catch (e) {
    date = moment(date).subtract(1, 'days').format('YYYY-MM-DD')
  }  
}


export const actions = {
  // fetch data by reading from a json file
  // if process.server is True, we're doing a server-side render,
  // so we load from a local json file.
  // otherwise, issue an http request using axios
  async forecastViz_fetch_data(_, {is_forecast, target_var, location, ref_date}) {
    var target_path;
    var data;
    if (is_forecast) {
      target_path = `data/forecasts/${target_var}_${location}_${ref_date}.json`;
    } else {
      target_path = `data/truth/${target_var}_${location}_${ref_date}.json`;
    }
    if (process.server) {
      target_path = './static/' + target_path;
      data = JSON.parse(require('fs').readFileSync(target_path, 'utf8'));
    } else {
      const response = await axios.get(target_path);
      data = response.data;
    }
    return data;
  },

  async forecastViz_options(_) {
    return {
      target_variables: target_variables,
      init_target_var: 'death',
      locations: locations,
      init_location: 'US',
      intervals: ['0%', '50%', '95%'],
      init_interval: '95%',
      available_as_ofs: available_as_ofs,
      init_as_of_date: date,
      current_date: available_as_ofs.death[available_as_ofs.death.length - 1],
      models: models,
      default_models: ['COVIDhub-ensemble'],
      all_models: false,
      disclaimer: 'Most forecasts have failed to reliably predict rapid changes in the trends of reported cases and hospitalizations. Due to this limitation, they should not be relied upon for decisions about the possibility or timing of rapid changes in trends.'
    }
  }
}
