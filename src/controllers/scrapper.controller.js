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

const exportResults = parsedResults => {
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
};

/**
 * Returns the dishe's image URL
 *
 * @param {string} text
 * @returns {string|null} cover url or null
 */
const parseImage = text => {
    const removeLeft = text.split("src='");
    const removeRight = removeLeft.length > 0 ? removeLeft[1].split("'") : null;

    return removeRight.length > 0 ? `${sourceUrl}/${removeRight[0].split(",")}` : null;
};

/**
 * Retrives the price of the dish
 * @param {string} text
 */
const parsePrice = text => {
    const removeLeft = text.split("<b>Dose:</b> ");
    const removeRight = removeLeft[1].split("'");

    return removeLeft.length > 0 ? removeRight[0].trim() : "0.00";
};

/**
 *
 * @param {CheerioElement} dish
 */
const extractMetadata = dish => {
    const onMouseOverContent = dish.attribs.onmouseover;
    const eachDishProperty = onMouseOverContent.toString().split(";");

    return {
        cover: parseImage(eachDishProperty[0]),
        price: parsePrice(eachDishProperty[1]),
    };
};

/**
 * Retrieves the dishes name
 *
 * @param {CheerioStatic} $
 * @param {CheerioElement} dish
 */
const getDishName = ($, dish) => {
    const fullName = $(dish)
        .text()
        .trim();
    const name = capitalize(fullName);

    return name;
};

/**
 * Checks if the dish is available or not
 *
 * @param {CheerioStatic} $
 * @param {CheerioElement} dish
 */
const getDishAvailability = ($, dish) => {
    const status = $(dish)
        .find("img")
        .attr("title");
    const available = status === "Prato Dispon�vel" ? true : false;

    return available;
};

/**
 *
 */
const getWebsiteContent = async () => {
    console.log(chalk.yellow.bgBlue(`\n  Scraping of todays menu...\n`));

    try {
        const response = await axios.get(url);
        const $ = await cheerio.load(response.data);

        const menuItems = $(".item_lista_pratos");

        menuItems.map((index, dish) => {
            const id = `${Date.now()}-${index}`;

            const name = getDishName($, dish);
            const available = getDishAvailability($, dish);
            const metadata = extractMetadata(dish);
            const category = "soup";

            const data = {
                id,
                name,
                available,
                category,
                ...metadata,
            };

            parsedResults.push(data);

            if (data) {
                return true;
            }

            return false;
        });

        console.log(chalk.cyan(`Done Scrapping!`));
        // exportResults(parsedResults);

        return parsedResults;
    } catch (error) {
        exportResults(parsedResults);
        console.error(error);
    }
};

module.exports = getWebsiteContent;
