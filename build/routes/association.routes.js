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
const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
router.post("/api/association/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkEmailUnique = yield association_model_1.Association.findOne({
            email: req.fields.email,
        });
        if (checkEmailUnique !== null) {
            throw new Error("email exist");
        }
        if (!req.fields.firstName ||
            !req.fields.lastName ||
            !req.fields.email ||
            !req.fields.password ||
            !req.fields.secondaryEstablishment ||
            !req.fields.rnaNumber ||
            !req.fields.sirene ||
            !req.fields.sireneNumber ||
            !req.fields.associationName ||
            !req.fields.objectAssociation ||
            !req.fields.headOffice ||
            !req.fields.publicUtility ||
            !req.fields.approvale ||
            !req.fields.needInsurance ||
            !req.fields.alsaceMoselleLaw ||
            !req.files.powerDelegation.path ||
            !req.files.associationStatutes.path ||
            !req.files.interiorRules.path ||
            !req.files.joafePublication.path) {
            throw new Error("not all need data");
        }
        const { firstName, lastName, email, password, secondaryEstablishment, rnaNumber, sirene, sireneNumber, associationName, objectAssociation, headOffice, publicUtility, approvale, needInsurance, alsaceMoselleLaw, } = req.fields;
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
        const passwordLength = password.length;
        if (passwordLength < 8) {
            throw new Error("password: too short");
        }
        if (!passwordRegex.test(password)) {
            throw new Error("password: not validated");
        }
        const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
        if (!emailRegex.test(email)) {
            throw new Error("email: not validated");
        }
        const salt = yield bcrypt.genSalt(10);
        const hashed = yield bcrypt.hash(password, salt);
        const newAssociation = new association_model_1.Association({
            role: "association",
            status: "validate",
            firstName,
            lastName,
            email,
            password: hashed,
            salt,
            token: uid2(16),
            secondaryEstablishment,
            rnaNumber,
            sirene,
            sireneNumber,
            associationName,
            objectAssociation,
            headOffice,
            publicUtility,
            approvale,
            needInsurance,
            alsaceMoselleLaw,
            timestamps: {
                createdAt: Date.now(),
            },
        });
        if (!req.files.powerDelegation.type.includes("pdf") ||
            !req.files.associationStatutes.type.includes("pdf") ||
            !req.files.interiorRules.type.includes("pdf") ||
            !req.files.joafePublication.type.includes("pdf")) {
            throw new Error("files: bad type for obligatory files");
        }
        const uploadFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
            const fileToUpload = yield cloudinary.uploader.upload(path, {
                folder: `/57585h_resto-du-coeur/92250_17-boulevard-de-la-repupblique`,
            });
            const fileLink = fileToUpload.secure_url;
            return fileLink;
        });
        newAssociation.powerDelegation = yield uploadFile(req.files.powerDelegation.path);
        newAssociation.associationStatutes = yield uploadFile(req.files.associationStatutes.path);
        newAssociation.interiorRules = yield uploadFile(req.files.interiorRules.path);
        newAssociation.joafePublication = yield uploadFile(req.files.joafePublication.path);
        console.log('file: association.routes.ts -> line 124 -> req.files.publicUtilityNotification?.type.includes("pdf")', req.files.publicUtilityNotification.type);
        if (publicUtility === "true") {
            if (req.files.publicUtilityNotification === undefined) {
                throw new Error("files: publicUtilityNotification has not file");
            }
            // NOT WORKING
            else if (!req.files.publicUtilityNotification.type.includes("pdf")) {
                throw new Error("files: bad type for publicUtilityNotification");
            }
            else {
                newAssociation.publicUtilityNotification = yield uploadFile(req.files.publicUtilityNotification.path);
            }
        }
        if (approvale === "true") {
            if (req.files.approvaleCertificate === undefined) {
                throw new Error("files: approvaleCertificate has not file");
            }
            else if (!req.files.approvaleCertificate.type.includes("pdf")) {
                throw new Error("files: bad type for approvaleCertificate");
            }
            else {
                newAssociation.approvaleCertificate = yield uploadFile(req.files.approvaleCertificate.path);
            }
        }
        if (needInsurance === "true") {
            if (req.files.insuranceCopy === undefined) {
                throw new Error("files: insuranceCopy has not file");
            }
            else if (!req.files.insuranceCopy.type.includes("pdf")) {
                throw new Error("files: bad type for insuranceCopy");
            }
            else {
                newAssociation.insuranceCopy = yield uploadFile(req.files.insuranceCopy.path);
            }
        }
        yield newAssociation.save();
        res.json(newAssociation);
    }
    catch (err) {
        res.status(400).json(err.message);
    }
}));
router.post("/api/association/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("file: association.routes.ts -> line 71 -> req.fields", req.fields);
        console.log("file: association.routes.ts -> line 169 ->  req.fields.email", req.fields.email);
        const associationToCheck = yield association_model_1.Association.findOne({
            email: req.fields.email,
        });
        console.log("file: association.routes.ts -> line 170 -> associationToCheck", associationToCheck);
        if (associationToCheck === null) {
            res.status(401).json({ message: "Unauthorized 1 !" });
        }
        else {
            const passwordClean = req.fields.password.replace(associationToCheck.salt, "");
            yield bcrypt.compare(passwordClean, associationToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (compareResult) {
                    associationToCheck.token = uid2(16);
                    yield associationToCheck.save();
                    res.status(200).json({ message: "you're login" });
                }
                else {
                    res.status(401).json({ message: "Unauthorized 2 !" });
                }
            }));
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
module.exports = router;
