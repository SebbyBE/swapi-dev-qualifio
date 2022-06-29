#!/usr/bin/env node
import { Command, Argument } from "commander";
import { defaultSpinner } from "./spinners.js";
import { fetching, interactiveMode } from "./process.js";
const program = new Command();

// Get name from filename real name can be given when bundeling for npm?
// const NAME = "SWAPI_CLI"
let name = process.argv[1];
if (name.includes("/")) {
  name = name.split("/").pop();
} else {
  name = name.split("\\").pop();
}

program
  .name(name)
  .description(
    "retrives information from the SWAPI, about the planet that have mountains and surface water above 0 for the desired film"
  )
  .addArgument(
    new Argument(
      "<filmNumber>",
      "The number of the film you want the info from (i for interactive mode)"
    ).choices(["1", "2", "3", "4", "5", "6", "i"])
  )
  .showHelpAfterError(false)
  .option("-v, --verbose", "Verbose mode")
  .action(async (filmNumber, options) => {
    let results = [];
    let selectedFilm;
    let { verbose = false } = options;
    if (filmNumber === "i") {
      [results, selectedFilm] = await interactiveMode();
      verbose = true;
    } else {
      !verbose && defaultSpinner.start();
      results = await fetching(filmNumber, options);
    }
    // Handle errors
    if (Number.isInteger(results)) {
      switch (results) {
        case 1:
          defaultSpinner.error({ text: "Couldn't get film data" });
          process.exit(1);

        case 2:
          defaultSpinner.error({
            text: "At least one planet couldn't be fetched, hence no data will be computed as it may be incomplete (Like the Jedi Archive Library on Coruscant on Coruscant🤷‍♂️)",
          });
          process.exit(2);

        case 3:
          defaultSpinner.error({
            text: "At least one planet data could not be transformed into JSON, as data cannot be complete the process will end with no result",
          });
          process.exit(3);

        default:
          defaultSpinner.error({
            text: "Unknown error. May the force be with you!",
          });
          process.exit(-1);
      }
    }
    let totalDiameter = 0;
    let verboseInfos = `In film #${
      filmNumber !== "i" ? filmNumber : selectedFilm
    } there are ${
      results.length
    } planets with mountains and surface water above 0.`;
    results.forEach((planet) => {
      totalDiameter += new Number(planet.diameter);
      verboseInfos += `\n- ${planet.name}, diameter: ${planet.diameter}`;
    });
    verboseInfos += `\nTotal diameter: ${totalDiameter}`;
    !verbose && defaultSpinner.success({ text: `${totalDiameter}` });
    verbose && console.log(verboseInfos);
  });

await program.parseAsync(process.argv);
process.exit(0);
