"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line import/no-import-module-exports
const mission_model_1 = require("../models/mission.model");
const express = require("express");
const associationAuthenticated = require("../middlewares/associationAuthenticated");
const router = express.Router();
router.get("/api/associationsss", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.status(200).json("{ id: newMission.id }");
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.post("/api/association/mission/create", associationAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("file: mission.routes.ts -> line 19 -> req.fields", req.fields);
        if (!req.fields.missionTitle ||
            !req.fields.place ||
            !req.fields.jobDescription ||
            !req.fields.startDate ||
            !req.fields.endDate) {
            throw new Error("not all need data");
        }
        const { missionTitle, place, jobDescription, startDate, endDate, groupedApplications, } = req.fields;
        if (missionTitle.length < 20) {
            throw new Error("title too short");
        }
        if (jobDescription.length < 500) {
            throw new Error("description too short");
        }
        const limiteGroupcandidacy = req.fields.limiteGroupcandidacy
            ? req.fields.limiteGroupcandidacy
            : 0;
        if (groupedApplications && (!limiteGroupcandidacy || limiteGroupcandidacy < 1)) {
            throw new Error("limiteGroupcandidacy not defined value");
        }
        const newMission = new mission_model_1.Mission({
            missionTitle,
            place,
            jobDescription,
            startDate,
            endDate,
            groupedApplications,
            timestamps: {
                createdAt: Date.now(),
            },
        });
        yield newMission.save();
        res.status(200).json({ id: newMission.id });
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
module.exports = router;
