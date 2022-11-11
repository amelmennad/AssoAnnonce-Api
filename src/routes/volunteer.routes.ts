// eslint-disable-next-line import/no-import-module-exports
import { Volunteer, IVolunteerSchema } from "../models/volunteer.model";

const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const cloudinary = require("cloudinary").v2;

const router = express.Router();

const volunteerAuthenticated = require("../middlewares/volunteerAuthenticated");

router.post("/api/volunteer/register", async (req, res): Promise<void> => {
  try {
    const checkEmailUnique: IVolunteerSchema | null = await Volunteer.findOne({
      email: req.fields.email,
    });
    if (checkEmailUnique !== null) {
      throw new Error("email exist");
    }

    if (
      !req.fields.firstName ||
      !req.fields.lastName ||
      !req.fields.email ||
      !req.fields.password ||
      !req.fields.birthday ||
      !req.fields.cgu
    ) {
      throw new Error("not all need data");
    }
    const { firstName, lastName, email, password, birthday, cgu }: IVolunteerSchema = req.fields;

    const dateRegex: RegExp = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;

    if (!dateRegex.test(birthday)) {
      throw new Error("birthday: not validated");
    }

    const diff = new Date(Date.now() - new Date(birthday).getTime());
    const age = Math.abs(diff.getUTCFullYear() - 1970);

    if (age < 16) {
      throw new Error("age: too young");
    }

    const passwordRegex: RegExp = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
    const passwordLength: Number = password.length;
    if (!passwordRegex.test(password)) {
      throw new Error("password: not validated");
    }
    if (passwordLength < 8) {
      throw new Error("password: too short");
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

    const newVolunteer: IVolunteerSchema = new Volunteer({
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

    await newVolunteer.save();

    res
      .status(200)
      .json({ id: newVolunteer.id, token: newVolunteer.token, role: newVolunteer.role });
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});

router.post("/api/volunteer/login", async (req, res) => {
  try {
    const volunteerToCheck: IVolunteerSchema | null = await Volunteer.findOne({
      email: req.fields.email,
    });

    if (volunteerToCheck === null) {
      throw new Error("mail not exist");
    } else {
      const passwordClean = req.fields.password.replace(volunteerToCheck, "");
      await bcrypt.compare(
        passwordClean,
        volunteerToCheck.password,
        async (err: any, compareResult: boolean): Promise<void> => {
          if (compareResult) {
            volunteerToCheck.token = uid2(16);
            await volunteerToCheck.save();

            res.status(200).json({
              id: volunteerToCheck.id,
              token: volunteerToCheck.token,
              role: volunteerToCheck.role,
            });
          } else {
            throw new Error("unauthorized - password not match");
          }
        }
      );
    }
  } catch (error: any) {
    res.status(401).json(error.message);
  }
});

router.get("/api/volunteer/profil", volunteerAuthenticated, (req, res) => {
  try {
    interface IVolunteerProfilData {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      birthday: string;
      avatar?: string;
      aboutme?: string;
    }

    const volunteerProfilData: IVolunteerProfilData = {
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
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});

router.put("/api/volunteer/update/:id", volunteerAuthenticated, async (req, res) => {
  try {
    const volunteerUpdate = req.volunteer;

    await bcrypt.compare(
      req.fields.currentPassword,
      volunteerUpdate.password,
      async (error: any, compareResult: boolean): Promise<void> => {
        if (compareResult) {
          try {
            if (req.fields.email) {
              const { email } = req.fields;
              const checkEmailUnique: IVolunteerSchema | null = await Volunteer.findOne({
                email,
              });
              if (checkEmailUnique !== null) {
                throw new Error("email exist");
              }
              const emailRegex: RegExp = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;
              if (!emailRegex.test(email)) {
                throw new Error("email: not validated");
              }
              volunteerUpdate.email = email;
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
              volunteerUpdate.password = hashed;
            }

            if (req.fields.aboutme) {
              const { aboutme } = req.fields;
              volunteerUpdate.aboutme = aboutme;
            }

            if (req.files.avatar) {
              const { avatar } = req.files;
              if (
                avatar.type.includes("jpg") ||
                avatar.type.includes("jpeg") ||
                avatar.type.includes("image/png")
              ) {
                const uploadFile = async (path: string): Promise<string> => {
                  const fileToUpload = await cloudinary.uploader.upload(path, {
                    folder: `/volunteer/`,
                  });
                  const fileLink: string = fileToUpload.secure_url;
                  return fileLink;
                };

                volunteerUpdate.avatar = await uploadFile(req.files.avatar.path);
                console.log(
                  "file: volunteer.routes.ts -> line 222 -> volunteerUpdate.avatar",
                  volunteerUpdate.avatar
                );
              } else {
                throw new Error("files: bad type");
              }
            }

            await volunteerUpdate.save();
            res.status(200).json(volunteerUpdate);
          } catch (err: any) {
            throw new Error("update error");
          }
        } else {
          throw new Error("unauthorized - password not match");
        }
      }
    );
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});

router.delete(
  "/api/volunteer/delete/:id",
  volunteerAuthenticated,
  async (req, res): Promise<void> => {
    try {
      const volunteerToCheck: IVolunteerSchema | null = await Volunteer.findById(req.params.id);
      if (volunteerToCheck === null) {
        throw new Error("unauthorized - id not exist");
      } else {
        await bcrypt.compare(
          req.fields.currentPassword,
          volunteerToCheck.password,
          async (err: any, compareResult: boolean): Promise<void> => {
            if (compareResult) {
              await Volunteer.findByIdAndDelete(req.params.id);
              res.json({ message: "Delete Volunteer" });
            } else {
              throw new Error("unauthorized - password not match");
            }
          }
        );
      }
    } catch (error: any) {
      res.status(400).json({ message: "Error to delete Volunteer" });
    }
  }
);

module.exports = router;
