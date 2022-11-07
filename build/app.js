"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const formidableMiddleware = require("express-formidable");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH"],
}));
app.use(morgan("combined"));
app.use(formidableMiddleware());
const volunteerRoutes = require("./routes/volunteer.routes");
const associationRoutes = require("./routes/association.routes");
const missionRoutes = require("./routes/mission.routes");
app.use(volunteerRoutes);
app.use(associationRoutes);
app.use(missionRoutes);
app.get("/", (req, res) => {
    res.header("crossorigin", "true");
    res.header("Access-Control-Allow-Origin", "*");
    res.json("Hello World");
});
app.all("*", (req, res) => {
    res.status(404).send("Page introuvable");
});
module.exports = app;
