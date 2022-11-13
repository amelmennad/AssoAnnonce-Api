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
const volunteer_model_1 = require("../models/volunteer.model");
const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;
const router = express.Router();
const volunteerAuthenticated = require("../middlewares/volunteerAuthenticated");
router.post("/api/volunteer/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("file: volunteer.routes.ts -> line 14 -> req", req.fields);
    try {
        const checkEmailUnique = yield volunteer_model_1.Volunteer.findOne({
            email: req.fields.email,
        });
        if (checkEmailUnique !== null) {
            throw new Error("email exist");
        }
        console.log("file: volunteer.routes.ts -> line 19 -> checkEmailUnique", checkEmailUnique);
        if (!req.fields.firstName ||
            !req.fields.lastName ||
            !req.fields.email ||
            !req.fields.password ||
            !req.fields.birthday ||
            !req.fields.cgu) {
            throw new Error("not all need data");
        }
        const { firstName, lastName, email, password, birthday, cgu } = req.fields;
        const dateRegex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
        if (!dateRegex.test(birthday)) {
            throw new Error("birthday: not validated");
        }
        const diff = new Date(Date.now() - new Date(birthday).getTime());
        const age = Math.abs(diff.getUTCFullYear() - 1970);
        if (age < 16) {
            throw new Error("age: too young");
        }
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
        const passwordLength = password.length;
        if (!passwordRegex.test(password)) {
            throw new Error("password: not validated");
        }
        if (passwordLength < 8) {
            throw new Error("password: too short");
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
        const newVolunteer = new volunteer_model_1.Volunteer({
            role: "volunteer",
            firstName,
            lastName,
            email,
            password: hashed,
            salt,
            token: uid2(16),
            birthday,
            cgu,
            timestamps: {
                createdAt: Date.now(),
            },
        });
        console.log("file: volunteer.routes.ts -> line 85 -> newVolunteer", "titi");
        yield newVolunteer.save();
        // console.log("file: volunteer.routes.ts -> line 85 -> newVolunteer", "newVolunteer");
        res.status(200).json({
            id: newVolunteer.id,
            token: newVolunteer.token,
            role: newVolunteer.role,
            firstName: newVolunteer.firstName,
            lastName: newVolunteer.lastName,
        });
    }
    catch (error) {
        res.status(400).json(error);
    }
}));
router.post("/api/volunteer/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteerToCheck = yield volunteer_model_1.Volunteer.findOne({
            email: req.fields.email,
        });
        if (volunteerToCheck === null) {
            throw new Error("mail not exist");
        }
        else {
            const passwordClean = req.fields.password.replace(volunteerToCheck, "");
            yield bcrypt.compare(passwordClean, volunteerToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    if (compareResult) {
                        volunteerToCheck.token = uid2(16);
                        yield volunteerToCheck.save();
                        res.status(200).json({
                            id: volunteerToCheck.id,
                            token: volunteerToCheck.token,
                            role: volunteerToCheck.role,
                            firstName: volunteerToCheck.firstName,
                            lastName: volunteerToCheck.lastName,
                        });
                    }
                    else {
                        throw new Error("unauthorized - password not match");
                    }
                }
                catch (e) {
                    res.status(401).json(e.message);
                }
            }));
        }
    }
    catch (error) {
        res.status(401).json(error.message);
    }
}));
router.get("/api/volunteer/:id", volunteerAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteerProfilData = yield volunteer_model_1.Volunteer.findById(req.params.id);
        if (volunteerProfilData === null) {
            res.status(404).json({ message: "Unauthorized" });
        }
        else {
            res.status(200).json(volunteerProfilData);
        }
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.put("/api/volunteer/update/:id", volunteerAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteerUpdate = req.volunteer;
        yield bcrypt.compare(req.fields.currentPassword, volunteerUpdate.password, (error, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
            if (compareResult) {
                try {
                    if (req.fields.email) {
                        const { email } = req.fields;
                        const checkEmailUnique = yield volunteer_model_1.Volunteer.findOne({
                            email,
                        });
                        if (checkEmailUnique !== null) {
                            throw new Error("email exist");
                        }
                        const emailRegex = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
                        if (!emailRegex.test(email)) {
                            throw new Error("email: not validated");
                        }
                        volunteerUpdate.email = email;
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
                        volunteerUpdate.password = hashed;
                    }
                    if (req.fields.aboutme) {
                        const { aboutme } = req.fields;
                        volunteerUpdate.aboutme = aboutme;
                    }
                    if (req.files.avatar) {
                        const { avatar } = req.files;
                        console.log("file: volunteer.routes.ts -> line 202 -> req.files", req.files);
                        if (avatar.type.includes("jpg") ||
                            avatar.type.includes("jpeg") ||
                            avatar.type.includes("image/png")) {
                            const uploadFile = (path) => __awaiter(void 0, void 0, void 0, function* () {
                                const fileToUpload = yield cloudinary.uploader.upload(path, {
                                    folder: `/volunteer/`,
                                });
                                const fileLink = fileToUpload.secure_url;
                                return fileLink;
                            });
                            volunteerUpdate.avatar = yield uploadFile(req.files.avatar.path);
                            console.log("file: volunteer.routes.ts -> line 222 -> volunteerUpdate.avatar", volunteerUpdate.avatar);
                        }
                        else {
                            throw new Error("files: bad type");
                        }
                    }
                    yield volunteerUpdate.save();
                    res.status(200).json(volunteerUpdate);
                }
                catch (err) {
                    throw new Error("update error");
                }
            }
            else {
                throw new Error("unauthorized - password not match");
            }
        }));
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.delete("/api/volunteer/delete/:id", volunteerAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteerToCheck = yield volunteer_model_1.Volunteer.findById(req.params.id);
        if (volunteerToCheck === null) {
            throw new Error("unauthorized - id not exist");
        }
        else {
            yield bcrypt.compare(req.fields.currentPassword, volunteerToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (compareResult) {
                    yield volunteer_model_1.Volunteer.findByIdAndDelete(req.params.id);
                    res.json({ message: "Delete Volunteer" });
                }
                else {
                    throw new Error("unauthorized - password not match");
                }
            }));
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error to delete Volunteer" });
    }
}));
module.exports = router;
