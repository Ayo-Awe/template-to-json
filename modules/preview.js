const fs = require("fs/promises");
const Handlebars = require("handlebars");
const puppeteer = require("puppeteer");

Handlebars.registerHelper("wrap", function (string) {
  return `{{${string}}}`;
});

async function preview(inputfile, outputFilename) {
  try {
    const file = await fs.readFile("./assets/template.hbs");
    const template = Handlebars.compile(file.toString());

    // Load data from json file
    const jsonData = await fs.readFile(inputfile);

    // Parse data into js object
    const data = JSON.parse(jsonData);

    // Add ids to element and text objects
    data.elements = data.elements.map(addID);
    data.texts = data.texts.map(addID);

    // Add dummy logo
    data.logo =
      "https://logodownload.org/wp-content/uploads/2017/05/google-chrome-logo-10.png";

    const templateHtml = template(data);

    // Launch new browser
    const browser = await puppeteer.launch();

    // Create new page and load template as contents
    const page = await browser.newPage();
    await page.setContent(templateHtml);

    // Create pdf preview
    await page.pdf({ path: outputFilename, width: 1016, height: 720 });

    // Close browser
    await browser.close();
    console.log("done!");
  } catch (error) {
    console.log("Something went wrong");
    console.log(error.message);
    process.exit();
  }
}

// Adds an objects index as it's id property
const addID = (e, i) => {
  return { ...e, _id: i };
};

module.exports = preview;
