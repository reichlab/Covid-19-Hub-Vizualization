import axios from 'axios';
import target_variables from '~/assets/target_variables.json';
import locations from '~/assets/locations.json';
import available_as_ofs from '~/static/data/available_as_ofs.json';
import current_truth from '~/static/data/truth/case_US_2021-09-04.json';
import forecasts from '~/static/data/forecasts/case_US_2021-09-04.json';
import models from '~/static/data/models.json';

export const state = () => ({
    target_variables: target_variables,
    target_var: "case",
    locations: locations,
    location: "US",
    available_as_ofs: available_as_ofs,
    as_of_date: available_as_ofs.case[available_as_ofs.case.length - 1],
    as_of_truth: current_truth,
    current_date: available_as_ofs.case[available_as_ofs.case.length - 1],
    current_truth: current_truth,
    forecasts: forecasts,
    models: models,
    interval_level: 95
})

export const mutations = {
    set_target_var (state, new_target_var) {
        state.target_var = new_target_var
        this.dispatch('fetch_current_truth')
        this.dispatch('fetch_as_of_truth')
        this.dispatch('fetch_forecasts')
    },
    set_location (state, new_location) {
        state.location = new_location
        this.dispatch('fetch_current_truth')
        this.dispatch('fetch_as_of_truth')
        this.dispatch('fetch_forecasts')
    },
    increment_as_of (state) {
        let as_of_index = state.available_as_ofs[state.target_var].indexOf(state.as_of_date)
        if (as_of_index < state.available_as_ofs[state.target_var].length - 1) {
            state.as_of_date = state.available_as_ofs[state.target_var][as_of_index + 1]
        }
        this.dispatch('fetch_as_of_truth')
        this.dispatch('fetch_forecasts')
        console.log(state.as_of_date)
    },
    decrement_as_of (state) {
        let as_of_index = state.available_as_ofs[state.target_var].indexOf(state.as_of_date)
        if (as_of_index > 0) {
            state.as_of_date = state.available_as_ofs[state.target_var][as_of_index - 1]
        }
        this.dispatch('fetch_as_of_truth')
        this.dispatch('fetch_forecasts')
        console.log(state.as_of_date)
    },
    set_current_truth (state, new_truth) {
        state.current_truth = new_truth
    },
    set_as_of_truth (state, new_truth) {
        state.as_of_truth = new_truth
    },
    set_forecasts (state, new_forecasts) {
        state.forecasts = new_forecasts
    }
}

export const actions = {
    async fetch_current_truth ({commit, state}) {
        try {
            let target_path = 'data/truth/' + state.target_var + '_' + state.location + '_' + state.current_date + '.json'
            const response = await axios.get(target_path)
            commit('set_current_truth', response.data)                
        } catch (error) {
            commit('set_current_truth', [])
            console.log(error)
        }
    },
    async fetch_as_of_truth ({commit, state}) {
        try {
            let target_path = 'data/truth/' + state.target_var + '_' + state.location + '_' + state.as_of_date + '.json'
            const response = await axios.get(target_path)
            commit('set_as_of_truth', response.data)                
        } catch (error) {
            commit('set_as_of_truth', [])
            console.log(error)
        }
    },
    async fetch_forecasts ({commit, state}) {
        try {
            let target_path = 'data/forecasts/' + state.target_var + '_' + state.location + '_' + state.as_of_date + '.json'
            const response = await axios.get(target_path)
            commit('set_forecasts', response.data)                
        } catch (error) {
            commit('set_forecasts', {})
            console.log(error)
        }
    }
}

export const getters = {
    target_variables: state => {
        return state.target_variables
    },
    locations: state => {
        return state.locations
    },
    plot_data: (state, getters) => {
        var pd = Object.keys(state.forecasts).map(
            model => {
                let model_forecasts = state.forecasts[model]
                return [
                    {
                        // point forecast
                        x: model_forecasts["target_end_date"],
                        y: model_forecasts["q0.5"],
                        type: "scatter",
                        name: model
                    },
                    {
                        // interval forecast -- currently fixed at 50%
                        x: [].concat(
                            model_forecasts["target_end_date"],
                            model_forecasts["target_end_date"].slice().reverse()),
                        y: [].concat(
                            model_forecasts["q0.25"],
                            model_forecasts["q0.75"].slice().reverse()),
                        fill: "toself",
                        opacity: 0.3,
                        line: {color: "transparent"},
                        type: "scatter",
                        name: model,
                        showlegend: false,
                        hoverinfo: "skip"
                    }                    
                ]
            }
        )
        pd = [].concat(...pd)
        
        pd.push({
            x: state.current_truth.date,
            y: state.current_truth.y,
            type: "scatter",
            mode: "lines",
            name: "Current Truth",
            marker: {
                color: "black"
            }
        })
        
        if (state.as_of_date != state.current_date) {
            pd.push({
                x: state.as_of_truth.date,
                y: state.as_of_truth.y,
                type: "scatter",
                mode: "lines",
                name: "Truth as of " + state.as_of_date,
                marker: {
                    color: "lightgray"
                }
            })
        }

        return pd
    }
}
