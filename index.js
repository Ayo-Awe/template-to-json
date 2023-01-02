const { Command } = require("commander");
const parse = require("./modules/parseHtml");
const preview = require("./modules/preview");
const program = new Command();

program
  .name("template-generator")
  .description(
    "CLI program to parse a html file into a json certificate template."
  );

// Parse command
program
  .command("parse")
  .description("Parse a html file to a json certificate template")
  .argument("<filename>", "path to html file")
  .option("-o, --output <output>", "Name of output json file", "output.json")
  .action(async (filename, options) => {
    await parse(filename, options.output);
  });

// Preview command
program
  .command("preview")
  .description("Generates a preview of the json certificate template")
  .argument("<filename>", "path to json file")
  .option("-o, --output <output>", "Name of output pdf file", "output.pdf")
  .action(async (filename, options) => {
    await preview(filename, options.output);
  });

program.parse();
