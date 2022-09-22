"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Association = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const AssociationSchema = new mongoose_1.Schema({
    role: { type: String, required: true, default: "association" },
    status: { type: String, required: true, default: "pending" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    powerDelegation: { type: String, required: true },
    associationStatutes: { type: String, required: true },
    interiorRules: { type: String, required: true },
    secondaryEstablishment: { type: Boolean, required: true },
    rnaNumber: { type: String, required: true },
    sirene: { type: String, required: true },
    sireneNumber: { type: String, required: true },
    associationName: { type: String, required: true },
    objectAssociation: { type: String, required: true },
    headOffice: { type: String, required: true },
    joafePublication: { type: String, required: true },
    publicUtility: { type: Boolean, required: true },
    publicUtilityNotification: String,
    approvale: { type: Boolean, required: true },
    approvaleCertificate: String,
    needInsurance: { type: Boolean, required: true },
    insuranceCopy: String,
    alsaceMoselleLaw: { type: Boolean, required: true },
    description: String,
    avatar: String,
    timestamps: {
        createdAt: String,
        updatedAt: String,
    },
});
exports.Association = mongoose_1.default.model("Association", AssociationSchema);
