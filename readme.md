# Certificate Template Parser

This is a cli application that parses html files into json certificate templates.

## Getting Started

To run this program, you should already have NodeJs installed.

Install all dependencies by running

```bash
npm install
```

## Overview

The essence of this application is to simplify the process of generating certificate templates. This is done by parsing a html file containing the desired template.

## Creating the Html file

To begin designing a template, it is advised that you start from the starter file provided i.e starter.html. You can add texts and elements by following the instructions below

### Texts

A text object refers to anyform of text that is on a certificate. Texts could be attributes or hard text values. Attributes will get replaced by the data from the certificate object e.g a name attribute would get replaced by the name of the certificate holder.

```html
<!-- Add Texts  -->
<h2 id="text-8">Lorem Ipsum has been the industry.</h2>

<!-- Add Texts that are attributes   -->
<h2 id="text-10" data-attribute="date">{{date}}</h2>
```

Texts should be created using "h2" tags. There's no hard reason for this except when the json is parsed back into a template, a h2 tag is used to represent the text. If a text is an attribute, the h2 tag should contain `data-attribute="<enter_attribute>"` as seen above. When a text is an attribute, the innerText wouldn't be taken into consideration. As a result the example above could be rewritten as

```html
...

<!-- Add Texts that are attributes   -->
<h2 id="text-10" data-attribute="date">Anything you want</h2>
```

Another important thing to note is that all texts should have an id that begins with
`text-` followed by any random string

### Elements

A element object refers to any form of image that is on a certificate that isn't the background image. Texts could be replaced by the users logo by specifying the `data-logo` with any data inside. The image will get replaced by the logo from the user.

```html
<!-- Add elements  -->
<img src="https://somesource" alt="" id="#element-1" />

<!-- Add elements that would be replaced by the logo  -->
<img src="https://somesource" alt="" id="#element-1" data-logo="true" />
```

Elements should be created using "img" tags. The src of the image tags should be live links to where the logo image

## Usage

There are two command for this CLI application,

- parse
- preview

Here's how to use them

### Parse

Usage: node index parse [options] <filename>

Parse a html file to a json certificate template

Arguments:
filename path to html file

Options:
-o, --output <output> Name of output json file (default: "output.json")
-h, --help display help for command

**Example**

Parse to default output.json file

```bash
node index parse example.html
```

Specify output file

```bash
node index parse -o template1.json example.html
```

### Preview

Usage: node index preview [options] <filename>

Generates a preview of the json certificate template

Arguments:
filename path to json file

Options:
-o, --output <output> Name of output pdf file (default: "output.pdf")
-h, --help display help for command

**Example**
Create preview to default output.pdf file

```bash
node index preview output.json
```

Specify output file

```bash
node index parse -o template1.pdf output.json
```

## Other Important Notes

- The a font url should be provided from google fonts api.
- The background image should maintain the aspect ratio of a landscape A4 format.
- The background image should have an id of "bg"
- Always make use of the starter files to save yourself trouble
- All font sizes should be specified in `em`
- All width, height, top and left values should be specified in `%`
