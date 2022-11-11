// eslint-disable-next-line import/no-import-module-exports
import { Association, IAssociationSchema } from "../models/association.model";

const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const router = express.Router();
const associationAuthenticated = require("../middlewares/associationAuthenticated");

router.post("/api/association/register", async (req, res): Promise<void> => {
  try {
    console.log("file: association.routes.ts -> req.fields", req.fields);
    console.log("file: association.routes.ts -> req.files", req.files);

    const checkEmailUnique: IAssociationSchema | null = await Association.findOne({
      email: req.fields.email,
    });
    if (checkEmailUnique !== null) {
      throw new Error("email exist");
    }

    if (
      !req.fields.lastName ||
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
      !req.fields.cgu
    ) {
      throw new Error("not all need data");
    }

    const {
      firstName,
      lastName,
      email,
      password,
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

    if (!cgu) {
      throw new Error("cgu: not validated");
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
        folder: `/${rnaNumber}_${associationName}/${address}`,
      });
      const fileLink: string = fileToUpload.secure_url;
      return fileLink;
    };

    newAssociation.powerDelegation = await uploadFile(req.files.powerDelegation.path);
    newAssociation.associationStatutes = await uploadFile(req.files.associationStatutes.path);
    newAssociation.interiorRules = await uploadFile(req.files.interiorRules.path);
    newAssociation.joafePublication = await uploadFile(req.files.joafePublication.path);

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

    if (sirene === "true") {
      if (req.fields.sireneNumber === undefined) {
        throw new Error("files: sireneNumber is require");
      } else {
        newAssociation.sireneNumber = req.fields.sireneNumber;
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
    res
      .status(200)
      .json({ id: newAssociation.id, token: newAssociation.token, role: newAssociation.role });
  } catch (err: any) {
    res.status(400).json(err.message);
  }
});

router.post("/api/association/login", async (req, res) => {
  try {
    const associationToCheck: IAssociationSchema | null = await Association.findOne({
      email: req.fields.email,
    });

    if (associationToCheck === null) {
      res.status(401).json({ message: "Unauthorized 1 !" });
    } else {
      const passwordClean = req.fields.password.replace(associationToCheck.salt, "");
      await bcrypt.compare(
        passwordClean,
        associationToCheck.password,
        async (err: any, compareResult: boolean): Promise<void> => {
          if (compareResult) {
            associationToCheck.token = uid2(16);
            await associationToCheck.save();

            res.status(200).json({
              id: associationToCheck.id,
              token: associationToCheck.token,
              role: associationToCheck.role,
            });
          } else {
            res.status(401).json({ message: "Unauthorized 2 !" });
          }
        }
      );
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/association/profil", associationAuthenticated, (req, res) => {
  try {
    interface IProfilData {
      firstName: string;
      lastName: string;
      email: string;
      avatar?: string;
      description?: string;
    }

    const profilData: IProfilData = {
      firstName: req.association.firstName,
      lastName: req.association.lastName,
      email: req.association.email,
    };

    if (req.association.avatar) {
      profilData.avatar = req.association.avatar;
    }

    if (req.association.description) {
      profilData.description = req.association.description;
    }

    res.status(200).json(profilData);
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});

// router.delete(
//   "/api/association/delete/:id",
//   associationAuthenticated,
//   async (req, res): Promise<void> => {
//     try {
//       const association: IAssociationSchema[] | null = await Association.findByIdAndDelete(
//         req.params.id
//       );
//       if (!association) {
//         res.status(404).json({ message: "Association not found" });
//       } else {
//         res.json({ message: "Delete Association" });
//       }
//     } catch (error: any) {
//       res.status(400).json({ message: "Error to delete Association" });
//     }
//   }
// );

module.exports = router;
