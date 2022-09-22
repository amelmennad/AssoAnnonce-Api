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
const router = express.Router();
router.post("/api/volunteer/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.fields.firstName ||
            !req.fields.lastName ||
            !req.fields.email ||
            !req.fields.password ||
            !req.fields.birthday) {
            throw new Error("not all need data");
        }
        const { firstName, lastName, email, password, birthday } = req.fields;
        const diff = new Date(Date.now() - new Date(birthday).getTime());
        const age = Math.abs(diff.getUTCFullYear() - 1970);
        if (age < 16) {
            throw new Error("age: too young");
        }
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
        const newVolunteer = new volunteer_model_1.Volunteer({
            role: "volunteer",
            firstName,
            lastName,
            email,
            password: hashed,
            token: uid2(16),
            birthday,
            timestamps: {
                createdAt: Date.now(),
            },
        });
        yield newVolunteer.save();
        res.json(newVolunteer);
    }
    catch (err) {
        res.status(400).json(err.message);
    }
}));
router.post("/api/volunteer/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const volunteerToCheck = yield volunteer_model_1.Volunteer.findOne({
            email: req.fields.email,
        });
        if (volunteerToCheck === null) {
            res.status(401).json({ message: "Unauthorized !" });
        }
        else {
            const passwordClean = req.fields.password.replace(req.fields.salt, "");
            yield bcrypt.compare(passwordClean, volunteerToCheck.password, (err, compareResult) => __awaiter(void 0, void 0, void 0, function* () {
                if (compareResult) {
                    volunteerToCheck.token = uid2(16);
                    yield volunteerToCheck.save();
                    res.status(200).json({ message: "you're login" });
                }
                else {
                    res.status(401).json({ message: "Unauthorized !" });
                }
            }));
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}));
module.exports = router;
module.exports = router;
