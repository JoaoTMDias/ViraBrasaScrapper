// Libraries
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const chalk = require("chalk");
const capitalize = require("lodash/capitalize");

// Files
const outputFile = "data.json";
const parsedResults = [];

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
 *
 * @param {CheerioElement} dish
 */
const extractMetadata = dish => {
    const functionOnMouseOver = dish.attribs.onmouseover;
    
    console.log(functionOnMouseOver.toString());

const getWebsiteContent = async () => {
    const sourceUrl = "https://www.virabrasa.com";
    const url = `${sourceUrl}/cd.php?op=menu_do_dia`;
    console.log(chalk.yellow.bgBlue(`\n  Scraping of todays menu...\n`));

    try {
        const response = await axios.get(url);
        const $ = await cheerio.load(response.data);

        const menuItems = $(".item_lista_pratos");

        console.log("menuItems: ", menuItems.length);
        menuItems.map((index, dish) => {
            console.log(typeof dish);

            extractMetadata(dish);
            const id = `${Date.now()}-${index}`;
            const fullName = $(dish)
                .text()
                .trim();

            const name = capitalize(fullName);

            const status = $(dish)
                .find("img")
                .attr("title");
            const available = status === "Prato Dispon�vel" ? true : false;
            const category = "soup";
            const data = {
                id,
                name,
                available,
                category,
                cover: `${sourceUrl}/images/imagem_prato_42.jpg`,
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
