const puppeteer = require("puppeteer");
const fs = require("fs/promises");
const css = require("css");
const { exit } = require("process");
const lodash = require("lodash");
const prettier = require("prettier");

async function parse(inputfile, outputFilename) {
  try {
    // Launch new browser
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disabled-setupid-sandbox"],
    });

    // Open new page in browser
    const page = await browser.newPage();
    const content = await fs.readFile(inputfile);

    // Set page content to handlebars template
    await page.setContent(content.toString());

    // Extract texts, elements, backgroundImage and fontUrl from html
    const data = await page.evaluate(evaluateHandler);

    data.elements = data.elements.map((elem) => {
      const { style, ...props } = elem;

      return {
        ...props,
        ...formatElementStyles(style),
      };
    });

    data.texts = data.texts.map((elem) => {
      const { style, ...props } = elem;
      return {
        ...props,
        ...formatTextStyles(style),
      };
    });

    // Convert data to json
    const jsonData = prettier.format(JSON.stringify(data), {
      parser: "json-stringify",
    });

    // Store file in output.json file
    await fs.writeFile(outputFilename, jsonData);

    await browser.close();
    console.log("done!!!");
  } catch (error) {
    console.log(error.message);
    exit();
  }
}

function parseRules(prev, curr) {
  return { ...prev, [lodash.camelCase(curr.property)]: curr.value };
}

function styleToObject(styleText) {
  return css
    .parse(styleText)
    .stylesheet.rules[0].declarations.reduce(parseRules, {});
}

function formatElementStyles(styleText) {
  const styleObject = styleToObject(styleText);

  const { top, left, height, width } = styleObject;

  return {
    top: propertyAsNumber(top),
    left: propertyAsNumber(left),
    height: propertyAsNumber(height),
    width: propertyAsNumber(width),
  };
}

function formatTextStyles(styleText) {
  const styleObject = styleToObject(styleText);

  const { top, left, width, fontWeight, fontSize, fontFamily, color } =
    styleObject;

  return {
    top: propertyAsNumber(top),
    left: propertyAsNumber(left),
    width: propertyAsNumber(width),
    fontWeight: propertyAsNumber(fontWeight),
    fontSize: propertyAsNumber(fontSize),
    fontFamily: fontFamily ? fontFamily.replaceAll('"', "") : undefined,
    color: color,
  };
}

// Returns a style property as a Number (without the unit)
function propertyAsNumber(propertyValue) {
  if (!propertyValue) return undefined;

  const string = propertyValue
    .replace("%", "")
    .replace("em", "")
    .replace("px", "")
    .replace("rem", "")
    .replace("vh", "")
    .replace("vw", "");

  return Number(string);
}

function evaluateHandler() {
  // Get stylesheet from style tag
  const styles = document.styleSheets;
  const cssRules = styles[styles.length - 1].cssRules;

  // Get all css rules as text
  const cssTexts = Array.from(cssRules).map((rule) => rule.cssText);

  // Filter css rules to only include only rules that begin with #element and #text
  const validStyles = cssTexts.filter((cssText) => {
    return cssText.startsWith("#text") || cssText.startsWith("#element");
  });

  const elements = [];
  const texts = [];

  // Sort objects into elements and texts
  validStyles.forEach((style) => {
    const element = document.querySelector(style.split(" ")[0]);

    if (!element) return;

    if (style.startsWith("#text")) {
      // Verify that the element is a h2 tag
      if (element.nodeName.toLowerCase() !== "h2")
        throw Error("All text elements must use h2", element.id);

      const { attribute } = element.dataset;
      // If text object format and push to texts
      if (attribute)
        // Text is an attribute
        return texts.push({ isAttribute: true, attribute, style });

      // Text is regular text
      return texts.push({ text: element.innerText, style });
    } else if (style.startsWith("#element")) {
      // Verify that the element is an image tag
      if (!(element instanceof HTMLImageElement))
        throw Error("All Elements must be images", element.id);

      if (element.dataset.logo)
        // Element is logo (logo elements are replaced by the user's logo)
        return elements.push({ isLogo: true, style });

      // Element is regular image
      return elements.push({ url: element.src, style });
    }
  });

  // Get background image
  const backgroundImage = document.querySelector("#bg")?.src;

  if (!backgroundImage)
    throw Error("Background Image must have an id of 'bg' ");

  // Get font Url from image
  const fontUrl = document.querySelector("link[rel=stylesheet]")?.href;

  if (!fontUrl) throw Error("No font link provided in html");

  return { elements, texts, backgroundImage, fontUrl };
}

module.exports = parse;
