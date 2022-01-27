# create json files with truth in them
# files are named as data/truth_<target_var>_<location>_<as_of>.json, where
# target_var is "case", "death", or "hosp",
# location is an identifier for a location, and
# as_of is a date in YYYY-MM-DD format indicating the data version date.
# A single json file has an object with one component for each model,
# each of which is in turn an object with entries for target end date of
# the forecast and the quantiles required to use to display point predictions
# and 50% or 95% prediction intervals:
# {
#   "UChicagoCHATTOPADHYAY-UnIT":{
#     "target_end_date":["2021-09-11","2021-09-18"],
#     "q0.025":[29933.91,29266.26],
#     "q0.975":[30138.25,29876.29],
#     "q0.75":[30065.63,29735.29],
#     "q0.5":[30016.51,29623.95],
#     "q0.25":[29978.13,29518.71]
#   },
#   "USC-SI_kJalpha":{
#     "target_end_date":["2021-09-11","2021-09-18"],
#     "q0.025":[25234.7965,20559.7374],
#     "q0.25":[27979.9251,24653.028],
#     "q0.5":[30061.4303,27964.816],
#     "q0.75":[32787.7076,31956.6914],
#     "q0.975":[34808.4415,35993.4228]
#   }
# }

library(covidData)
library(covidHubUtils)
library(tidyverse)
library(jsonlite)

# flag to indicate whether we want to regenerate forecast json files for all
# past weeks, or only for the present week. There are two options:
# - FALSE will regenerate all forecast files for past weeks. This should only be
# necessary if a change is made to the formatting of the files, or we need to
# add in results for an older model that updated past forecasts
# - TRUE will generate forecast files only for the latest week. This will
# be the appropriate option most of the time

# generate_latest_only <- FALSE
generate_latest_only <- TRUE

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

# models in viz
models <- covidHubUtils::get_model_metadata(
    source = "local_hub_repo",
    hub_repo_path = hub_repo_path) %>%
    dplyr::filter(
        designation %in% c("primary", "secondary") |
        ensemble_of_hub_models == TRUE) %>%
    dplyr::pull(model)

for (target_var in c("case", "death", "hosp")) {
    message(target_var)
    if (target_var == "case") {
        max_horizon <- 4
        targets <- paste0(1:4, " wk ahead inc case")
        locations <- covidData::fips_codes %>%
            dplyr::filter(
                nchar(location) == 2 # state and national level only
            ) %>%
            dplyr::pull(location)
    } else if (target_var == "death") {
        max_horizon <- 4
        targets <- paste0(1:4, " wk ahead inc death")
        locations <- covidData::fips_codes %>%
            dplyr::filter(
                nchar(location) == 2 # state and national level only
            ) %>%
            dplyr::pull(location)
    } else {
        max_horizon <- 28
        targets <- paste0(1:34, " day ahead inc hosp")
        locations <- covidData::fips_codes %>%
            dplyr::filter(
                nchar(location) == 2 # state and national level only
            ) %>%
            dplyr::pull(location)
    }

    as_ofs <- available_as_ofs[[target_var]]
    if (generate_latest_only) {
        as_ofs <- max(as_ofs)
    }
    for (as_of in as.character(as_ofs)) {
        forecasts <- covidHubUtils::load_forecasts(
           models = models, 
           dates = as.Date(as_of) + 2, 
           date_window_size = 6,
           locations = locations, 
           types = "quantile",
           targets = targets, 
           source = "local_hub_repo", 
           hub_repo_path = hub_repo_path, 
           as_of = NULL, 
           verbose = FALSE, 
           hub = "US"
           ) 
        all_forecasts <- covidHubUtils::align_forecasts(forecasts) %>% 
           dplyr::filter(
            relative_horizon <= max_horizon,
            format(quantile, digits = 3, nsmall = 3) %in%
            format(c(0.025, 0.25, 0.5, 0.75, 0.975), digits = 3, nsmall = 3)
            )

        # # Leaving old loading step for reference
        # all_forecasts <- covidEnsembles::load_covid_forecasts_relative_horizon(
        #     hub = "US",
        #     source = "local_hub_repo",
        #     hub_repo_path = hub_repo_path,
        #     data_processed_subpath = "data-processed/",
        #     monday_dates = as.Date(as_of) + 2,
        #     as_of = NULL,
        #     model_abbrs = models,
        #     timezero_window_size = 6,
        #     locations = locations,
        #     targets = targets,
        #     max_horizon = max_horizon,
        #     required_quantiles = c(0.025, 0.25, 0.5, 0.75, 0.975)
        # )

        for (location in unique(all_forecasts$location)) {
            target_filename <- paste0(
                "static/data/forecasts/",
                target_var, "_", location, "_", as_of,  ".json")

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
                target_filename
            )
        }
    }
}

# get list of all models
models <- NULL
for (target_var in c("case", "death", "hosp")) {
    # locations in viz -- should really be target specific, but here we
    # list a superset of possibilities and just grab the ones that exist
    locations <- covidData::fips_codes %>%
        dplyr::filter(nchar(location) == 2) %>%
        dplyr::pull(location)
    as_ofs <- available_as_ofs[[target_var]]
    for (as_of in as.character(as_ofs)) {
        for (location in locations) {
            file_path <- paste0("static/data/forecasts/",
                target_var, "_",
                location, "_",
                as_of,  ".json")
            if (file.exists(file_path)) {
                forecasts <- jsonlite::fromJSON(readLines(file_path))
                models <- unique(c(models, names(forecasts)))
            }
        }
    }
}
# sort, and put COVIDhub-ensemble and COVIDhub-baseline at the beginning
models <- sort(models)
models <- c(
    c("COVIDhub-ensemble", "COVIDhub-baseline"),
    models[!(models %in% c("COVIDhub-ensemble", "COVIDhub-baseline"))]
)
writeLines(jsonlite::toJSON(models), "static/data/models.json")

