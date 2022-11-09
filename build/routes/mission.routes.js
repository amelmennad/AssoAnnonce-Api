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
const association_model_1 = require("../models/association.model");
// eslint-disable-next-line import/no-import-module-exports
const mission_model_1 = require("../models/mission.model");
const express = require("express");
const router = express.Router();
router.post("/api/association/mission/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.fields.missionTitle ||
            !req.fields.place ||
            !req.fields.jobDescription ||
            !req.fields.startDate ||
            !req.fields.endDate ||
            !req.fields.association) {
            throw new Error("not all need data");
        }
        const { missionTitle, place, jobDescription, startDate, endDate, groupedApplications, association, } = req.fields;
        const associationCheck = yield association_model_1.Association.findById(association);
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
            throw new Error("date: not validated");
        }
        const nowTimestamp = Date.now();
        const startDateTimestamp = new Date(startDate).getTime();
        const endDateTimestamp = new Date(endDate).getTime();
        if (startDateTimestamp < nowTimestamp ||
            endDateTimestamp < nowTimestamp ||
            startDateTimestamp > endDateTimestamp) {
            throw new Error("date: not validated");
        }
        if (associationCheck === null) {
            res.status(401).json({ message: "unauthorized - association not exist" });
            // TODO : logout in front
        }
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
            association,
            timestamps: {
                createdAt: Date.now(),
            },
        });
        yield newMission.save();
        res.status(200).json({ id: newMission.id });
        // res.status(200).json(newMission);
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
            res.status(404).json({ message: "mission not found" });
            // TODO : redirect 404
        }
        res.status(200).json(mission);
    }
    catch (error) {
        res.status(400).json(error.message);
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
            // TODO : afficher message Aucune mission en cours
        }
        res.status(200).json(allMissionOneAssociation);
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.delete("/api/association/mission/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield mission_model_1.Mission.findByIdAndDelete(req.params.id);
        if (!mission) {
            res.status(404).json({ message: "Mission not found" });
        }
        else {
            return res.json({ message: "Delete mission" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error to delete mission" });
    }
}));
module.exports = router;
