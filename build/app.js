"use strict";
const express = require("express");
const formidableMiddleware = require("express-formidable");
const morgan = require("morgan");
const app = express();
app.use(morgan("combined"));
app.use(formidableMiddleware());
const volunteerRoutes = require("./routes/volunteer.routes");
const associationRoutes = require("./routes/association.routes");
app.use(volunteerRoutes);
app.use(associationRoutes);
app.get("/", (req, res) => {
    res.json("Hello World");
});
app.all("*", (req, res) => {
    res.status(404).send("Page introuvable");
});
module.exports = app;
