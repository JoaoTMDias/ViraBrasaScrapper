// Libraries
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const capitalize = require("lodash/capitalize");

// Files
const outputFile = "data.json";
const parsedResults = [];
const sourceUrl = "https://www.virabrasa.com";
const url = `${sourceUrl}/cd.php?op=menu_do_dia`;

/**
 * @typedef {Object} IParsedResults
 *
 * @prop {string} id,
 * @prop {string} name
 * @prop {boolean} available
 * @prop {string} cover
 * @prop {string} price
 */

/**
 *
 * @param {IParsedResults} parsedResults
 */
function exportResults(parsedResults) {
    fs.writeFile(outputFile, JSON.stringify(parsedResults, null, 4), err => {
        if (err) {
            console.log(err);
        }
        console.log(
            chalk.yellow.bgBlue(
                `\n ${chalk.underline.bold(
                    parsedResults.length
                )} Results exported successfully to ${chalk.underline.bold(outputFile)}\n`
            )
        );
    });
}

/**
 * Returns the dishe's image URL
 *
 * @param {string} text
 * @returns {string|null} cover url or null
 */
function parseImage(text) {
    const removeLeft = text.split("src='");
    const removeRight = removeLeft.length > 0 ? removeLeft[1].split("'") : null;

    return removeRight.length > 0 ? `${sourceUrl}/${removeRight[0].split(",")}` : null;
}

/**
 * Retrives the price of the dish
 * @param {string} text
 */
function parsePrice(text) {
    const removeLeft = text.split("<b>Dose:</b> ");
    const removeRight = removeLeft[1].split("'");

    return removeLeft.length > 0 ? `${removeRight[0].trim()}` : "0.00";
}

/**
 *
 * @param {CheerioElement} dish
 */
function extractMetadata(dish) {
    const onMouseOverContent = dish.attribs.onmouseover;
    const eachDishProperty = onMouseOverContent.toString().split(";");

    return {
        cover: parseImage(eachDishProperty[0]),
        price: parsePrice(eachDishProperty[1]),
    };
}

/**
 * Retrieves the dishes name
 *
 * @param {CheerioStatic} $
 * @param {CheerioElement} dish
 */
function getName($, dish) {
    const fullName = $(dish)
        .text()
        .trim();
    const name = capitalize(fullName);

    return name;
}

/**
 * Checks if the dish is available or not
 *
 * @param {CheerioStatic} $
 * @param {CheerioElement} dish
 */
function getAvailability($, dish) {
    const status = $(dish)
        .find("img")
        .attr("title");
    const available = status === "Prato Dispon�vel" ? true : false;

    return available;
}

/**
 * Scrappes Vira Brasa website and returns an array of dishes
 *
 * @returns {IParsedResults}
 */
const scrapper = async () => {
    console.log(chalk.yellow.bgBlue(`\n  Scraping of todays menu...\n`));

    try {
        /**
         * @type {axios.AxiosResponse<url>}
         */
        const response = await axios.get(url);
        const $ = await cheerio.load(response.data);

        const menuItems = $(".item_lista_pratos");

        menuItems.map((index, dish) => {
            const id = `${Date.now()}-${index}`;

            const name = getName($, dish);
            const available = getAvailability($, dish);
            const metadata = extractMetadata(dish);

            const data = {
                id,
                name,
                available,
                ...metadata,
            };

            parsedResults.push(data);

            return data | null;
        });

        console.log(chalk.cyan(`👍 Done Scrapping!`));
        // exportResults(parsedResults);

        return parsedResults;
    } catch (error) {
        exportResults(parsedResults);
        console.error(error);
    }
};

module.exports = scrapper;
