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
    try {
        const checkEmailUnique = yield volunteer_model_1.Volunteer.findOne({
            email: req.fields.email,
        });
        if (checkEmailUnique !== null) {
            throw new Error("email exist");
        }
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
            timestamps: {
                createdAt: Date.now(),
            },
        });
        yield newVolunteer.save();
        res
            .status(200)
            .json({ id: newVolunteer.id, token: newVolunteer.token, role: newVolunteer.role });
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.post("/api/volunteer/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteerToCheck = yield volunteer_model_1.Volunteer.findOne({
            email: req.fields.email,
        });
        if (volunteerToCheck === null) {
            res.status(401).json({ message: "unauthorized - mail not exist" });
        }
        else {
            const passwordClean = req.fields.password.replace(volunteerToCheck, "");
            yield bcrypt.compare(passwordClean, volunteerToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (compareResult) {
                    volunteerToCheck.token = uid2(16);
                    yield volunteerToCheck.save();
                    res.status(200).json({
                        id: volunteerToCheck.id,
                        token: volunteerToCheck.token,
                        role: volunteerToCheck.role,
                    });
                }
                else {
                    res.status(401).json({ message: "unauthorized - password not match" });
                }
            }));
        }
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.get("/api/volunteer/profil", volunteerAuthenticated, (req, res) => {
    try {
        const volunteerProfilData = {
            id: req.volunteer.id,
            firstName: req.volunteer.firstName,
            lastName: req.volunteer.lastName,
            email: req.volunteer.email,
            birthday: req.volunteer.birthday,
        };
        if (req.volunteer.avatar) {
            volunteerProfilData.avatar = req.volunteer.avatar;
        }
        if (req.volunteer.aboutme) {
            volunteerProfilData.aboutme = req.volunteer.aboutme;
        }
        res.status(200).json(volunteerProfilData);
    }
    catch (error) {
        res.status(400).json(error.message);
    }
});
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
                    res.status(400).json(err.message);
                }
            }
            else {
                res.status(401).json({ message: "unauthorized - password not match" });
            }
        }));
    }
    catch (error) {
        res.status(400).json(error.message);
    }
}));
router.delete("/api/volunteer/delete/:id", volunteerAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mission = yield volunteer_model_1.Volunteer.findByIdAndDelete(req.params.id);
        if (!mission) {
            res.status(404).json({ message: "Volunteer not found" });
        }
        else {
            res.json({ message: "Delete Volunteer" });
        }
    }
    catch (error) {
        res.status(400).json({ message: "Error to delete Volunteer" });
    }
}));
module.exports = router;
