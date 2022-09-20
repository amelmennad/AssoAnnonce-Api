// eslint-disable-next-line import/no-import-module-exports
import { Volunteer, IVolunteerSchema } from "../models/volunteer.model";

const express = require("express");
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const router = express.Router();

router.post("/api/volunteer/register", async (req, res): Promise<void> => {
  try {
    if (
      !req.fields.firstName ||
      !req.fields.lastName ||
      !req.fields.email ||
      !req.fields.password ||
      !req.fields.birthday
    ) {
      throw new Error("not all need data");
    }
    const { firstName, lastName, email, password, birthday }: IVolunteerSchema = req.fields;

    const diff = new Date(Date.now() - new Date(birthday).getTime());
    const age = Math.abs(diff.getUTCFullYear() - 1970);

    if (age < 16) {
      throw new Error("age: too young");
    }

    const passwordRegex: RegExp = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[^\w\d\s:])([^\s]){8,}$/;
    const passwordLength: Number = password.length;
    if (passwordLength < 8) {
      throw new Error("password: too short");
    }
    if (!passwordRegex.test(password)) {
      throw new Error("password: not validated");
    }

    const emailRegex: RegExp = /[a-z0-9]+@[a-z]+.[a-z]{2,3}/;
    if (!emailRegex.test(email)) {
      throw new Error("email: not validated");
    }

    const salt: string = await bcrypt.genSalt(10);
    const hashed: string = await bcrypt.hash(password, salt);

    const newVolunteer: IVolunteerSchema = new Volunteer({
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

    await newVolunteer.save();

    res.json(newVolunteer);
  } catch (err: any) {
    res.status(400).json(err.message);
  }
});

module.exports = router;