"use-strict";
import fetch from "node-fetch";
import inquirer from "inquirer";
import {
  spinnerGetFilmInfos,
  spinnerGetPlanetsInfos,
  spinnerComputePlanetsInfos,
} from "./spinners.js";

const FILM_URL = "https://swapi.dev/api/films/";

/**
 * Normal mode
 *
 * @param {string} filmNumber
 * @param {object} options
 * @returns {Promise<object>}
 * @throws {Number}
 */
export async function fetching(filmNumber, { verbose = false }) {
  const ret = [];
  let body = {};
  let promises = [];

  // Fetching film data
  verbose && spinnerGetFilmInfos.start();
  const response = await fetch(`${FILM_URL}${filmNumber}/`);
  try {
    body = await response.json();
  } catch (e) {
    // Error code for film not found or error while getting film data
    return 1;
  }
  const planets = body.planets;
  verbose &&
    spinnerGetFilmInfos.success({
      text: `Data from ${body?.title} retrieved`,
    });

  // Fetching planets data that appear in the film
  verbose && spinnerGetPlanetsInfos.start();
  for (let i = 0; i < planets.length; i++) {
    promises.push(fetch(planets[i]));
  }
  const data = await Promise.all(promises);
  data.forEach((d) => {
    if (d.status !== 200) {
      // Error code if all the plannet couldn't be fetched, incomplete data abort.
      return 2;
    }
  });
  verbose &&
    spinnerGetPlanetsInfos.success({
      text: `Data from the planets in "${body?.title}" retrieved, ${planets.length} in this Episode`,
    });

  // Manipulate data for later usage
  verbose && spinnerComputePlanetsInfos.start();
  // Reset Promise.all array
  promises = [];
  // Transform data to JSON
  let planetsInfo = [];
  try {
    data.forEach((response) => {
      promises.push(response.json());
    });
    planetsInfo = await Promise.all(promises);
  } catch (error) {
    // All planet couldn't be transformed to JSON, missing data, abort
    return 3;
  }

  // Extract planet for the requested task (Mountains and surface water above 0)
  planetsInfo.forEach((planet) => {
    if (planet.terrain.includes("mountains") && planet.surface_water > 0) {
      ret.push(planet);
    }
  });
  verbose && spinnerComputePlanetsInfos.success({ text: "Data processed" });

  // Return requested planet from film
  return ret;
}

/**
 * Interactive Mode
 *
 * @returns {Promise<Array>, Number}
 */
export async function interactiveMode() {
  const answer = await inquirer.prompt({
    name: "filmNumber",
    type: "list",
    message: "Which film do you want the info from ?",
    choices: [
      { name: "Episode IV: A New Hope", value: 1 },
      { name: "Episode V: The Empire Strikes Back", value: 2 },
      { name: "Episode VI: Return of the Jedi", value: 3 },
      { name: "Episode I: The Phantom Menace", value: 4 },
      { name: "Episode II: Attack of the Clones", value: 5 },
      { name: "Episode III: Revenge of the Sith", value: 6 },
    ],
  });

  return [
    await fetching(answer.filmNumber, { verbose: true }),
    answer.filmNumber,
  ];
}
