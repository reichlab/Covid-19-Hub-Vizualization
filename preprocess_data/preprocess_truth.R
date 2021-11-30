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
library(tidyverse)
library(jsonlite)

# flag to indicate whether we want to regenerate truth json files for all
# past weeks, or only for the present week. There are two options:
# - FALSE will regenerate all truth files for past weeks. This should only be
# necessary if a change is made to the formatting of the files, or we need to
# add in results for an older model that updated past forecasts
# - TRUE will generate truth files only for the latest week. This will
# be the appropriate option most of the time

# generate_latest_only <- FALSE
generate_latest_only <- TRUE

last_as_of <- lubridate::floor_date(Sys.Date(), unit = "week", week_start = 6)

available_as_ofs <- purrr::map(
    c("case", "death", "hosp"),
    function(target_var) {
        if (target_var == "death") {
            first_as_of <- as.Date("2020-04-11")
        } else if (target_var == "case") {
            first_as_of <- as.Date("2020-08-01")
        } else {
            first_as_of <- as.Date("2020-12-05")
        }
        as_ofs <- seq.Date(from = first_as_of, to = last_as_of, by = 7)
        return(as_ofs)
    }
)
names(available_as_ofs) <- c("case", "death", "hosp")
available_as_ofs_json <- jsonlite::toJSON(available_as_ofs)
writeLines(
    available_as_ofs_json,
    paste0("./Covid-19-Hub-Vizualization/static/data/available_as_ofs.json")
)

locations_json <- covidData::fips_codes %>%
    dplyr::filter(nchar(location) == 2) %>%
    dplyr::select(value = location, text = location_name) %>%
    jsonlite::toJSON()
writeLines(
    locations_json,
    paste0("assets/locations.json")
)


for (target_var in c("case", "death", "hosp")) {
    as_ofs <- available_as_ofs[[target_var]]
    if (generate_latest_only) {
        as_ofs <- max(as_ofs)
    }
    if (target_var == "death") {
        data_start_date <- as.Date("2020-03-01")
    } else if (target_var == "case") {
        data_start_date <- as.Date("2020-03-01")
    } else {
        data_start_date <- as.Date("2020-10-01")
    }
    for (as_of in as.character(as_ofs)) {
        data <- covidData::load_data(
            as_of = as.Date(as_of) + 1,
            temporal_resolution = ifelse(target_var == "hosp", "daily", "weekly"),
            spatial_resolution = c("state", "national"),
            measure = target_var
        )
        
        for (location in unique(data$location)) {
            location_data <- data %>%
                dplyr::filter(
                    location == UQ(location),
                    date >= data_start_date) %>%
                dplyr::arrange(date) %>%
                dplyr::select(date = date, y = inc) %>%
                as.list() %>%
                jsonlite::toJSON()

            writeLines(
                location_data,
                paste0("./Covid-19-Hub-Vizualization/static/data/truth/", target_var, "_", location, "_", as_of,  ".json")
            )
        }
    }
}
