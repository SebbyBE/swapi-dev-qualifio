"use-strict";
import { createSpinner } from "nanospinner";

export const spinnerGetFilmInfos = createSpinner(
  "Getting info from the time frame era inputted..."
);
export const spinnerGetPlanetsInfos = createSpinner(
  "Collecting data on the planets from the Jedi Archive Library on Coruscant"
);
export const spinnerComputePlanetsInfos = createSpinner("Processing data...");

export const defaultSpinner = createSpinner(
  "Collectin intel from the Jedi Archives on Coruscant"
);
