// eslint-disable-next-line import/no-import-module-exports
import { Association, IAssociationSchema } from "../models/association.model";

const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const urlSlug = require("url-slug");
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
    if (checkEmailUnique) {
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
    const checkRnaNumber: IAssociationSchema[] | null = await Association.find({
      rnaNumber: req.fields.rnaNumber,
    });
    if (checkRnaNumber.length !== 0) {
      throw new Error("rna exist");
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
      status: "validate", // pending, validate, reject, archive
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
        folder: `/association/${rnaNumber}_${associationName}/${address}`,
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
    let slug = urlSlug.convert(`${associationName}`, {
      transformer: urlSlug.LOWERCASE_TRANSFORMER,
      separator: "-",
    });
    console.log("file: volunteer.routes.ts -> line 90 -> slug", slug);

    const slugExiste: IAssociationSchema[] | null = await Association.find({
      slug: { $regex: `.*${slug}.*` },
    });

    if (slugExiste.length === 0) {
      slug = `${slug}-1`;
    } else {
      slug = `${slug}-${slugExiste.length}`;
    }

    newAssociation.slug = slug;

    await newAssociation.save();
    res.status(200).json({
      id: newAssociation.id,
      token: newAssociation.token,
      role: newAssociation.role,
      slug: newAssociation.slug,
    });
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
      throw new Error("Unauthorized");
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
              slug: associationToCheck.slug,
            });
          } else {
            throw new Error("Unauthorized");
          }
        }
      );
    }
  } catch (error: any) {
    res.status(500).json(error.message);
  }
});

router.get("/api/association/:slug", async (req, res) => {
  try {
    const associationProfilData = await Association.findOne({
      slug: req.params.slug,
    });

    if (associationProfilData === null) {
      res.status(404).json({ message: "Unauthorized" });
    } else {
      res.status(200).json(associationProfilData);
    }
  } catch (error: any) {
    res.status(404).json("not found");
  }
});

router.put("/api/association/update/:id", associationAuthenticated, async (req, res) => {
  try {
    const associationUpdate = req.association;

    await bcrypt.compare(
      req.fields.currentPassword,
      associationUpdate.password,
      async (error: any, compareResult: boolean): Promise<void> => {
        if (compareResult) {
          if (req.fields.email) {
            const { email } = req.fields;
            const checkEmailUnique: IAssociationSchema | null = await Association.findOne({
              email,
            });
            if (checkEmailUnique !== null) {
              throw new Error("email exist");
            }
            const emailRegex: RegExp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
            if (!emailRegex.test(email)) {
              throw new Error("email: not validated");
            }
            associationUpdate.email = email;
          }

          if (req.fields.password) {
            const { password } = req.fields;
            const passwordRegex: RegExp =
              /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
            const passwordLength: Number = password.length;
            if (!passwordRegex.test(password)) {
              throw new Error("password: not validated");
            }
            if (passwordLength < 8) {
              throw new Error("password: too short");
            }
            const salt: string = await bcrypt.genSalt(10);
            const hashed: string = await bcrypt.hash(password, salt);
            associationUpdate.password = hashed;
          }

          if (req.fields.description) {
            const { description } = req.fields;
            associationUpdate.description = description;
          }

          if (req.files.logo) {
            const { logo } = req.files;
            if (
              logo.type.includes("jpg") ||
              logo.type.includes("jpeg") ||
              logo.type.includes("image/png")
            ) {
              const uploadFile = async (path: string): Promise<string> => {
                const fileToUpload = await cloudinary.uploader.upload(path, {
                  folder: `/association/logo`,
                });
                const fileLink: string = fileToUpload.secure_url;
                return fileLink;
              };

              associationUpdate.logo = await uploadFile(req.files.logo.path);
              console.log(
                "file: association.routes.ts -> line 222 -> associationUpdate.logo",
                associationUpdate.logo
              );
            } else {
              throw new Error("files: bad type");
            }
          }

          await associationUpdate.save();
          res.status(200).json(associationUpdate);
        } else {
          throw new Error("unauthorized - password not match");
        }
      }
    );
  } catch (error: any) {
    res.status(401).json(error.message);
  }
});

router.put(
  "/api/association/archive/:id",
  associationAuthenticated,
  async (req, res): Promise<void> => {
    try {
      const associationToCheck: IAssociationSchema | null = await Association.findById(
        req.params.id
      );
      if (associationToCheck === null) {
        throw new Error("unauthorized - id not exist");
      } else {
        await bcrypt.compare(
          req.fields.currentPassword,
          associationToCheck.password,
          async (err: any, compareResult: boolean): Promise<void> => {
            if (compareResult) {
              associationToCheck.status = "achive";
              await associationToCheck.save();
              res.json({ message: "Archive Association" });
            } else {
              throw new Error("unauthorized - password not match");
            }
          }
        );
      }
    } catch (error: any) {
      res.status(401).json({ message: "Error to delete Association" });
    }
  }
);

module.exports = router;
