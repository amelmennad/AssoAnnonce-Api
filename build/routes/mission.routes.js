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
// import { Association } from "../models/association.model";
// eslint-disable-next-line import/no-import-module-exports
const mission_model_1 = require("../models/mission.model");
const express = require("express");
const associationAuthenticated = require("../middlewares/associationAuthenticated");
const router = express.Router();
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
router.get("/api/association/missions", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // gerer la notion de date n'affichier que les mission actuel ou a venir
        const allMission = yield mission_model_1.Mission.find().populate("association");
        res.status(200).json(allMission);
        // if exite redirect vers l'annonce
    }
    catch (error) {
        res.status(400).json(error.message);
        // else redirect 404
    }
}));
router.get("/api/association/mission/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // gerer la notion de date n'affichier que les mission actuel ou a venir sauf cas authentification association see inside acrhiver
        const mission = yield mission_model_1.Mission.findById(req.params.id).populate("association");
        console.log("file: mission.routes.ts -> line 83 -> allMission", mission);
        if (mission === null) {
            throw new Error("mission not found");
            // TODO : redirect 404
        }
        res.status(200).json(mission);
    }
    catch (error) {
        res.status(404).json(error.message);
    }
}));
router.get("/api/association/missions/:associationId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // gerer la notion de date n'affichier que les mission actuel ou a venir
        const allMissionOneAssociation = yield mission_model_1.Mission.find({
            association: req.params.associationId,
        }).populate("association");
        console.log("file: mission.routes.ts -> line 83 -> allMission", allMissionOneAssociation);
        if (allMissionOneAssociation === null) {
            res.status(200).json({ message: "empty mission for this association" });
        }
        res.status(200).json(allMissionOneAssociation);
    }
    catch (error) {
        res.status(404).json(error.message);
    }
}));
router.delete("/api/association/mission/delete/:id", associationAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield mission_model_1.Mission.findByIdAndDelete(req.params.id);
        if (!mission) {
            throw new Error("Mission not found");
        }
        else {
            res.json({ message: "Delete mission" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error to delete mission" });
    }
}));
module.exports = router;
