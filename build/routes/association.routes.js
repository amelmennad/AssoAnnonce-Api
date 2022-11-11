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
const associationAuthenticated = require("../middlewares/associationAuthenticated");
router.post("/api/association/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("file: association.routes.ts -> req.fields", req.fields);
        console.log("file: association.routes.ts -> req.files", req.files);
        const checkEmailUnique = yield association_model_1.Association.findOne({
            email: req.fields.email,
        });
        if (checkEmailUnique !== null) {
            throw new Error("email exist");
        }
        if (!req.fields.lastName ||
            !req.fields.firstName ||
            !req.fields.email ||
            !req.fields.password ||
            !req.fields.secondaryEstablishment ||
            !req.fields.address ||
            !req.fields.rnaNumber ||
            !req.fields.sirene ||
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
            !req.files.joafePublication.path ||
            !req.fields.cgu) {
            throw new Error("not all need data");
        }
        const { firstName, lastName, email, password, secondaryEstablishment, address, rnaNumber, sirene, associationName, objectAssociation, headOffice, publicUtility, approvale, needInsurance, alsaceMoselleLaw, cgu, } = req.fields;
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
        if (!cgu) {
            throw new Error("cgu: not validated");
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
            address,
            rnaNumber,
            sirene,
            associationName,
            objectAssociation,
            headOffice,
            publicUtility,
            approvale,
            needInsurance,
            alsaceMoselleLaw,
            cgu,
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
                folder: `/${rnaNumber}_${associationName}/${address}`,
            });
            const fileLink = fileToUpload.secure_url;
            return fileLink;
        });
        newAssociation.powerDelegation = yield uploadFile(req.files.powerDelegation.path);
        newAssociation.associationStatutes = yield uploadFile(req.files.associationStatutes.path);
        newAssociation.interiorRules = yield uploadFile(req.files.interiorRules.path);
        newAssociation.joafePublication = yield uploadFile(req.files.joafePublication.path);
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
        if (sirene === "true") {
            if (req.fields.sireneNumber === undefined) {
                throw new Error("files: sireneNumber is require");
            }
            else {
                newAssociation.sireneNumber = req.fields.sireneNumber;
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
        res
            .status(200)
            .json({ id: newAssociation.id, token: newAssociation.token, role: newAssociation.role });
    }
    catch (err) {
        res.status(400).json(err.message);
    }
}));
router.post("/api/association/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const associationToCheck = yield association_model_1.Association.findOne({
            email: req.fields.email,
        });
        if (associationToCheck === null) {
            res.status(401).json({ message: "Unauthorized 1 !" });
        }
        else {
            const passwordClean = req.fields.password.replace(associationToCheck.salt, "");
            yield bcrypt.compare(passwordClean, associationToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (compareResult) {
                    associationToCheck.token = uid2(16);
                    yield associationToCheck.save();
                    res.status(200).json({
                        id: associationToCheck.id,
                        token: associationToCheck.token,
                        role: associationToCheck.role,
                    });
                }
                else {
                    throw new Error("Unauthorized");
                }
            }));
        }
    }
    catch (error) {
        res.status(500).json(error.message);
    }
}));
router.get("/api/association/profil", associationAuthenticated, (req, res) => {
    try {
        const profilData = {
            firstName: req.association.firstName,
            lastName: req.association.lastName,
            email: req.association.email,
        };
        if (req.association.logo) {
            profilData.logo = req.association.logo;
        }
        if (req.association.description) {
            profilData.description = req.association.description;
        }
        res.status(200).json(profilData);
    }
    catch (error) {
        res.status(400).json(error.message);
    }
});
router.put("/api/association/update/:id", associationAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const associationUpdate = req.association;
        yield bcrypt.compare(req.fields.currentPassword, associationUpdate.password, (error, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
            if (compareResult) {
                if (req.fields.email) {
                    const { email } = req.fields;
                    const checkEmailUnique = yield association_model_1.Association.findOne({
                        email,
                    });
                    if (checkEmailUnique !== null) {
                        throw new Error("email exist");
                    }
                    const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
                    if (!emailRegex.test(email)) {
                        throw new Error("email: not validated");
                    }
                    associationUpdate.email = email;
                }
                if (req.fields.password) {
                    const { password } = req.fields;
                    const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
                    const passwordLength = password.length;
                    if (!passwordRegex.test(password)) {
                        throw new Error("password: not validated");
                    }
                    if (passwordLength < 8) {
                        throw new Error("password: too short");
                    }
                    const salt = yield bcrypt.genSalt(10);
                    const hashed = yield bcrypt.hash(password, salt);
                    associationUpdate.password = hashed;
                }
                if (req.fields.description) {
                    const { description } = req.fields;
                    associationUpdate.description = description;
                }
                if (req.files.logo) {
                    const { logo } = req.files;
                    if (logo.type.includes("jpg") ||
                        logo.type.includes("jpeg") ||
                        logo.type.includes("image/png")) {
                        const uploadFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
                            const fileToUpload = yield cloudinary.uploader.upload(path, {
                                folder: `/association/logo`,
                            });
                            const fileLink = fileToUpload.secure_url;
                            return fileLink;
                        });
                        associationUpdate.logo = yield uploadFile(req.files.logo.path);
                        console.log("file: association.routes.ts -> line 222 -> associationUpdate.logo", associationUpdate.logo);
                    }
                    else {
                        throw new Error("files: bad type");
                    }
                }
                yield associationUpdate.save();
                res.status(200).json(associationUpdate);
            }
            else {
                throw new Error("unauthorized - password not match");
            }
        }));
    }
    catch (error) {
        res.status(401).json(error.message);
    }
}));
router.put("/api/association/archive/:id", associationAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const associationToCheck = yield association_model_1.Association.findById(req.params.id);
        if (associationToCheck === null) {
            throw new Error("unauthorized - id not exist");
        }
        else {
            yield bcrypt.compare(req.fields.currentPassword, associationToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (compareResult) {
                    associationToCheck.status = "achive";
                    yield associationToCheck.save();
                    res.json({ message: "Archive Association" });
                }
                else {
                    throw new Error("unauthorized - password not match");
                }
            }));
        }
    }
    catch (error) {
        res.status(401).json({ message: "Error to delete Association" });
    }
}));
module.exports = router;
