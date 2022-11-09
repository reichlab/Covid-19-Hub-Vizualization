# fork

This repo is a fork of https://github.com/reichlab/Covid-19-Hub-Vizualization to work out deployment options for
a https://github.com/reichlab/predtimechart/ -based https://viz.covid19forecasthub.org/ site. This fork does not contain
any nuxt- or vue-related files.

# predtimechar

This fork temporarily includes in-development `predtimechart.css` and `predtimechart.js` files, which index.html
directly loads, rather than through the jsdelivr CDN.

# netlify

This fork is linked to https://www.netlify.com/ so that pushes to `master` will initiate a deployment. The production
site is xx (we have not set up a custom domain for this fork).

# updating forecast and truth JSON files

Updating forecast and truth JSON files is done in the upstream repository via GitHub Actions and
the `update_forecasts_weekly.yml` or `update_truth_daily.yml` workflows. To manually run them, run these R scfripts (TBD
verify correct):

- (one-time setup) install_dependencies.R
- preprocess_truth.R
- preprocess_forecasts.R

