// Libraries
const express = require("express");
// Controllers
const getWebsiteContent = require("../controllers/index.controllers");

// Router
const routes = express.Router();

// Routes
routes.get("/", (req, res) => res.send("Vira Brasa Scrapper"));
routes.get("/today", async (req, res) => {
    const result = await getWebsiteContent();

    return res.send(result);
});

module.exports = routes;
