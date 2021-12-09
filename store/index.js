// store/index.js
import axios from 'axios';

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
  }
}
