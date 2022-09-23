// eslint-disable-next-line import/no-import-module-exports
import { Association, IAssociationSchema } from "../models/association.model";

const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

router.post("/api/association/register", async (req, res): Promise<void> => {
  try {
    if (
      !req.fields.firstName ||
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
      !req.files.joafePublication.path
    ) {
      throw new Error("not all need data");
    }

    const {
      firstName,
      lastName,
      email,
      password,
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
    }: IAssociationSchema = req.fields;

    const passwordRegex: RegExp = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
    const passwordLength: Number = password.length;
    if (passwordLength < 8) {
      throw new Error("password: too short");
    }
    if (!passwordRegex.test(password)) {
      throw new Error("password: not validated");
    }

    const emailRegex: RegExp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
    if (!emailRegex.test(email)) {
      throw new Error("email: not validated");
    }

    const salt: string = await bcrypt.genSalt(10);
    const hashed: string = await bcrypt.hash(password, salt);

    const newAssociation: IAssociationSchema = new Association({
      role: "association",
      status: "validate", // pending, validate, reject
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

    if (
      !req.files.powerDelegation.type.includes("pdf") ||
      !req.files.associationStatutes.type.includes("pdf") ||
      !req.files.interiorRules.type.includes("pdf") ||
      !req.files.joafePublication.type.includes("pdf")
    ) {
      throw new Error("files: bad type for obligatory files");
    }

    const uploadFile = async (path: string): Promise<string> => {
      const fileToUpload = await cloudinary.uploader.upload(path, {
        folder: `/57585h_resto-du-coeur/92250_17-boulevard-de-la-repupblique`,
      });
      const fileLink: string = fileToUpload.secure_url;
      return fileLink;
    };

    newAssociation.powerDelegation = await uploadFile(req.files.powerDelegation.path);
    newAssociation.associationStatutes = await uploadFile(req.files.associationStatutes.path);
    newAssociation.interiorRules = await uploadFile(req.files.interiorRules.path);
    newAssociation.joafePublication = await uploadFile(req.files.joafePublication.path);

    console.log(
      'file: association.routes.ts -> line 124 -> req.files.publicUtilityNotification?.type.includes("pdf")',
      req.files.publicUtilityNotification.type
    );

    if (publicUtility === "true") {
      if (req.files.publicUtilityNotification === undefined) {
        throw new Error("files: publicUtilityNotification has not file");
      }
      // NOT WORKING
      else if (!req.files.publicUtilityNotification.type.includes("pdf")) {
        throw new Error("files: bad type for publicUtilityNotification");
      } else {
        newAssociation.publicUtilityNotification = await uploadFile(
          req.files.publicUtilityNotification.path
        );
      }
    }
    if (approvale === "true") {
      if (req.files.approvaleCertificate === undefined) {
        throw new Error("files: approvaleCertificate has not file");
      } else if (!req.files.approvaleCertificate.type.includes("pdf")) {
        throw new Error("files: bad type for approvaleCertificate");
      } else {
        newAssociation.approvaleCertificate = await uploadFile(req.files.approvaleCertificate.path);
      }
    }

    if (needInsurance === "true") {
      if (req.files.insuranceCopy === undefined) {
        throw new Error("files: insuranceCopy has not file");
      } else if (!req.files.insuranceCopy.type.includes("pdf")) {
        throw new Error("files: bad type for insuranceCopy");
      } else {
        newAssociation.insuranceCopy = await uploadFile(req.files.insuranceCopy.path);
      }
    }

    await newAssociation.save();
    res.json(newAssociation);
  } catch (err: any) {
    res.status(400).json(err.message);
  }
});

router.post("/api/association/login", async (req, res) => {
  try {
    console.log("file: association.routes.ts -> line 71 -> req.fields", req.fields);
    const associationToCheck: IAssociationSchema | null = await Association.findOne({
      email: req.fields.email,
    });

    if (associationToCheck === null) {
      res.status(401).json({ message: "Unauthorized !" });
    } else {
      const passwordClean = req.fields.password.replace(req.fields.salt, "");
      await bcrypt.compare(
        passwordClean,
        associationToCheck.password,
        async (err: any, compareResult: boolean): Promise<void> => {
          if (compareResult) {
            associationToCheck.token = uid2(16);
            await associationToCheck.save();

            res.status(200).json({ message: "you're login" });
          } else {
            res.status(401).json({ message: "Unauthorized !" });
          }
        }
      );
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
