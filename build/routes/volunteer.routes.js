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
        const { firstName, lastName, email, password, birthday } = req.fields;
        const arrayBirtday = birthday.split("-");
        const diff = new Date(Date.now() -
            new Date(Number(arrayBirtday[0]), Number(arrayBirtday[1]), Number(arrayBirtday[2])).getTime());
        const age = Math.abs(diff.getUTCFullYear() - 1970);
        if (age < 16) {
            throw new Error("age: too young");
        }
        const passwordRegex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,16}$/;
        // /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*d)(?=.*[@$!%*?&])[A-Za-z0-9 d@$!%*?&]{8,}$/;
        if (password.length < 8) {
            throw new Error("password: too short");
        }
        if (!passwordRegex.test(password)) {
            throw new Error("password: not validated");
        }
        const emailRegex = /[a-z0-9]+@[a-z]+.[a-z]{2,3}/;
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
module.exports = router;
// Login create newtoken
// newVolunteer.token = jwt.sign({
//   userId: newVolunteer._id },
//   "RANDOM_TOKEN_SECRET",
//   { expiresIn: "24h" });
