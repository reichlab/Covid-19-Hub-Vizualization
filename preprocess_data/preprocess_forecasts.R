# create json files with truth in them
# files are named as data/truth_<target_var>_<location>_<as_of>.json, where
# target_var is "case", "death", or "hosp",
# location is an identifier for a location, and
# as_of is a date in YYYY-MM-DD format indicating the data version date.
# A single json file has data in the format of a list of (date, value) pairs:
# [
#    {date: "YYYY-MM-DD", value: 0},
#    ...,
#    {date: "YYYY-MM-DD", value: 1}
# ]

library(covidData)
library(covidHubUtils)
library(tidyverse)
library(jsonlite)

# path to local clone of covid19-forecast-hub repo
hub_repo_path <- "../covid19-forecast-hub"

# as of dates included in viz. These are Saturdays to match with truth dates,
# but we'll actually pull forecasts dated up through the following Monday
last_as_of <- lubridate::floor_date(Sys.Date(), unit = "week", week_start = 6)

available_as_ofs <- purrr::map(
    c("case", "death", "hosp"),
    function(target_var) {
        if (target_var == "death") {
            first_as_of <- as.Date("2020-04-11")
            data_start_date <- as.Date("2020-03-01")
        } else if (target_var == "case") {
            first_as_of <- as.Date("2020-08-01")
            data_start_date <- as.Date("2020-03-01")
        } else {
            first_as_of <- as.Date("2020-12-05")        
            data_start_date <- as.Date("2020-10-01")
        }
        as_ofs <- seq.Date(from = first_as_of, to = last_as_of, by = 7)
        return(as_ofs)
    }
)
names(available_as_ofs) <- c("case", "death", "hosp")

# locations in viz
locations <- covidData::fips_codes %>%
    dplyr::filter(nchar(location) == 2) %>%
    dplyr::pull(location)

# models in viz
models <- covidHubUtils::get_model_designations(
    source = "local_hub_repo",
    hub_repo_path = hub_repo_path) %>%
    dplyr::filter(designation %in% c("primary", "secondary")) %>%
    dplyr::pull(model)

for (target_var in c("case", "death", "hosp")) {
    if (target_var == "case") {
        max_horizon = 2
        targets <- paste0(1:2, " wk ahead inc case")
    } else if(target_var == "death") {
        max_horizon = 4
        targets <- paste0(1:4, " wk ahead inc death")
    } else {
        max_horizon = 28
        targets <- paste0(1:34, " day ahead inc hosp")
    }
    
    as_ofs <- available_as_ofs[[target_var]]
    for (as_of in as.character(as_ofs)) {
        all_forecasts <- covidEnsembles::load_covid_forecasts_relative_horizon(
            hub = "US",
            source = "local_hub_repo",
            hub_repo_path = hub_repo_path,
            data_processed_subpath = "data-processed/",
            monday_dates = as.Date(as_of) + 2,
            as_of = NULL,
            model_abbrs = models,
            timezero_window_size = 6,
            locations = locations,
            targets = targets,
            max_horizon = max_horizon,
            required_quantiles = c(0.025, 0.25, 0.5, 0.75, 0.975)
        )
        
        for (location in unique(all_forecasts$location)) {
            location_forecasts <- all_forecasts %>%
                dplyr::filter(location == UQ(location))
            
            location_models <- unique(location_forecasts$model)
            location_forecasts_by_model <- purrr::map(
                location_models,
                function (model) {
                    location_model_forecasts <- location_forecasts %>%
                        dplyr::filter(model == UQ(model)) %>%
                        dplyr::select(
                            target_end_date,
                            quantile,
                            value) %>%
                        tidyr::pivot_wider(
                            names_from = "quantile",
                            names_prefix = "q",
                            values_from = "value"
                        )
                    
                    required_qs <- paste0("q", c("0.025", "0.25", "0.5", "0.75", "0.975"))
                    if (!all(required_qs %in% colnames(location_model_forecasts))) {
                        return(NULL)
                    }
                    
                    rows_without_missing <- apply(
                        location_model_forecasts,
                        1,
                        function(fc_row) {
                            !any(is.na(fc_row))
                        }
                    )
                    location_model_forecasts <- location_model_forecasts[rows_without_missing, ]
                    if (nrow(location_model_forecasts) == 0)  {
                        return(NULL)
                    }
                    
                    return(as.list(location_model_forecasts))
                }
            )
            names(location_forecasts_by_model) <- location_models
            non_null_entries <- sapply(
                location_forecasts_by_model,
                function(component) { !is.null(component) })
            location_forecasts_by_model <- location_forecasts_by_model[non_null_entries]

            location_forecasts_by_model <- location_forecasts_by_model %>%
                jsonlite::toJSON()

            writeLines(
                location_forecasts_by_model,
                paste0("static/data/forecasts/", target_var, "_", location, "_", as_of,  ".json")
            )
        }
    }
}

# get list of all models
models <- NULL
for (target_var in c("case", "death", "hosp")) {
    as_ofs <- available_as_ofs[[target_var]]
    for (as_of in as.character(as_ofs)) {
        for (location in unique(all_forecasts$location)) {
            file_path <- paste0("static/data/forecasts/",
                target_var, "_",
                location, "_",
                as_of,  ".json")
            forecasts <- jsonlite::fromJSON(file_path)
            models <- unique(c(models, names(forecasts)))
        }
    }
}
writeLines(jsonlite::toJSON(models), "static/data/models.json")
