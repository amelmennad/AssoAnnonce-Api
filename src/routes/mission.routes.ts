// eslint-disable-next-line import/no-import-module-exports
import { IMissionSchema, Mission } from "../models/mission.model";

const express = require("express");

const associationAuthenticated = require("../middlewares/associationAuthenticated");

const router = express.Router();
router.get("/api/associationsss", async (req, res): Promise<void> => {
  try {
    res.status(200).json("{ id: newMission.id }");
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});

router.post(
  "/api/association/mission/create",
  associationAuthenticated,
  async (req, res): Promise<void> => {
    try {
      console.log("file: mission.routes.ts -> line 19 -> req.fields", req.fields);
      if (
        !req.fields.missionTitle ||
        !req.fields.place ||
        !req.fields.jobDescription ||
        !req.fields.startDate ||
        !req.fields.endDate
      ) {
        throw new Error("not all need data");
      }

      const {
        missionTitle,
        place,
        jobDescription,
        startDate,
        endDate,
        groupedApplications,
      }: IMissionSchema = req.fields;

      if (missionTitle.length < 20) {
        throw new Error("title too short");
      }
      if (jobDescription.length < 500) {
        throw new Error("description too short");
      }

      const limiteGroupcandidacy = req.fields.limiteGroupcandidacy
        ? req.fields.limiteGroupcandidacy
        : 0;

      if (groupedApplications && (!limiteGroupcandidacy || limiteGroupcandidacy < 1)) {
        throw new Error("limiteGroupcandidacy not defined value");
      }
      const newMission: IMissionSchema = new Mission({
        missionTitle,
        place,
        jobDescription,
        startDate,
        endDate,
        groupedApplications,
        timestamps: {
          createdAt: Date.now(),
        },
      });

      await newMission.save();

      res.status(200).json({ id: newMission.id });
    } catch (error: any) {
      res.status(400).json(error.message);
    }
  }
);

module.exports = router;
