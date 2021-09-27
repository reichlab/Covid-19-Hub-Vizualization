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
    intervals: ["0%","50%","95%"],
    interval:"50%",
    location: "US",
    available_as_ofs: available_as_ofs,
    as_of_date: available_as_ofs.case[available_as_ofs.case.length - 1],
    as_of_truth: current_truth,
    current_date: available_as_ofs.case[available_as_ofs.case.length - 1],
    current_truth: current_truth,
    forecasts: forecasts,
    models: models,
    current_models:  ['COVIDhub-ensemble'],
    models_to_add: Object.keys(forecasts).slice(1,),
    interval_level: 95,
    data:['Current Truth','Truth As Of'],
    colours:['#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786', '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921'],
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
    set_interval (state, new_interval) {
        state.interval = new_interval
        
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
    },
    remove_from_current_model (state, item) {
        let index = state.current_models.indexOf(item)
        state.current_models.splice(index,1)
    
    },
    add_to_current_model(state, val){
        
        state.current_models.push(val)
    },
    add_to_data(state, val){
        state.data.push(val)
    },
    remove_from_data (state, item) {
        let index = state.data.indexOf(item)
        state.data.splice(index,1)
    },  
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
    intervals: state => {
        return state.intervals
    },
    models: state => {
        return state.models
    },
    colours: state => {
        return state.colours
    },
    data: state => {
        return state.data
    },
    current_models:state => {
        return state.current_models
    },
    forecasts:state => {
        return state.forecasts
    },
    plot_layout:state => {
        let variable  = state.target_var==='case'? 'weekly COVID-19 cases': state.target_var =='hosp'? 'daily COVID-19 hospitalizations':'weekly COVID-19 deaths'
        let variable2 = state.target_var==='case'? 'Incident weekly cases': state.target_var =='hosp'? 'Incident daily hospitalizations':'Incident weekly deaths'
        let result = locations.filter(obj => {
            return obj.value === state.location
          })
        let location = result[0].text
        return {
            autosize: true,
            showlegend:false,
            title: {text:'Forecasts of '+variable+' in '+location +' as of '+state.as_of_date},
            xaxis: {
            title: {text: 'Date'}
            },
            yaxis: {
            title: {text: variable2}
            }
          }
    },
    plot_data: (state, getters) => {
        var pd = Object.keys(state.forecasts).map(
            (model) => {
        
                if (state.current_models.includes(model))
                {
                let index = state.models.indexOf(model)
                let model_forecasts = state.forecasts[model]
                let upper_quantile, lower_quantile
                if (state.interval == "50%"){
                    lower_quantile = "q0.25"
                    upper_quantile = "q0.75"
                    return [
                        {
                            // point forecast
                            x: model_forecasts["target_end_date"],
                            y: model_forecasts["q0.5"],
                            type: "scatter",
                            name: model,
                            line: {color: state.colours[index%10]},
                        },
                        {
                            // interval forecast -- currently fixed at 50%
                            x: [].concat(
                                model_forecasts["target_end_date"],
                                model_forecasts["target_end_date"].slice().reverse()),
                            y: [].concat(
                                model_forecasts[lower_quantile],
                                model_forecasts[upper_quantile].slice().reverse()),
                            fill: "toself",
                            fillcolor: state.colours[index%10],
                            opacity: 0.3,
                            line: {color: "transparent"},
                            type: "scatter",
                            name: model,
                            showlegend: false,
                            hoverinfo: "skip"
                            
                        }                    
                    ]
                }
                else if (state.interval == "95%"){
                    lower_quantile = "q0.025"
                    upper_quantile = "q0.975"
                    return [
                        {
                            // point forecast
                            x: model_forecasts["target_end_date"],
                            y: model_forecasts["q0.5"],
                            type: "scatter",
                            name: model,
                            line: {color: state.colours[index%10]},
                        },
                        {
                            // interval forecast -- currently fixed at 50%
                            x: [].concat(
                                model_forecasts["target_end_date"],
                                model_forecasts["target_end_date"].slice().reverse()),
                            y: [].concat(
                                model_forecasts[lower_quantile],
                                model_forecasts[upper_quantile].slice().reverse()),
                            fill: "toself",
                            fillcolor: state.colours[index%10],
                            opacity: 0.3,
                            line: {color: "transparent"},
                            type: "scatter",
                            name: model,
                            showlegend: false,
                            hoverinfo: "skip"
                            
                        }                    
                    ]
                }
                else{
                    return{
                        // point forecast
                        x: model_forecasts["target_end_date"],
                        y: model_forecasts["q0.5"],
                        type: "scatter",
                        name: model,
                        line: {color: state.colours[index%10]}
                    }
                }
                }
                else{
                    return []
                }
                
                
            }
        )
        pd = [].concat(...pd)
        console.log(pd)
        if(state.data.includes('Current Truth')){
        pd.push({
            x: state.current_truth.date,
            y: state.current_truth.y,
            type: "scatter",
            mode: "lines",
            name: "Current Truth",
            marker: {
                color: "darkgray"
            }
        })
    }
        if (state.as_of_date != state.current_date && state.data.includes('Truth As Of')) {
            pd.push({
                x: state.as_of_truth.date,
                y: state.as_of_truth.y,
                type: "scatter",
                mode: "lines",
                name: "Truth as of " + state.as_of_date,
                marker: {
                    color: "black"
                }
            })
        }

        return pd
    }
}
