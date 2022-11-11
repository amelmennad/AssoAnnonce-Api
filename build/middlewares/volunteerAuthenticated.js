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
const volunteerAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.fields);
    try {
        if (req.headers.authorization) {
            const bearerToken = req.headers.authorization.replace("Bearer ", "");
            const volunteer = yield volunteer_model_1.Volunteer.findOne({ token: bearerToken });
            if (req.params.id && (volunteer === null || volunteer === void 0 ? void 0 : volunteer.id) !== req.params.id) {
                throw new Error("unauthorized");
            }
            if (volunteer) {
                req.volunteer = volunteer;
                next();
            }
            else {
                throw new Error("not exist token");
            }
        }
        else {
            throw new Error("not send token");
        }
    }
    catch (error) {
        res.status(401).json(error.message);
    }
});
module.exports = volunteerAuthenticated;
