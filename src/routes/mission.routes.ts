// eslint-disable-next-line import/no-import-module-exports
// import { Association } from "../models/association.model";
// eslint-disable-next-line import/no-import-module-exports
import { IMissionSchema, Mission } from "../models/mission.model";

const express = require("express");

const associationAuthenticated = require("../middlewares/associationAuthenticated");

const router = express.Router();

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

router.get("/api/association/missions", async (req, res): Promise<void> => {
  try {
    // gerer la notion de date n'affichier que les mission actuel ou a venir

    const allMission: IMissionSchema[] | null = await Mission.find().populate("association");
    res.status(200).json(allMission);
    // if exite redirect vers l'annonce
  } catch (error: any) {
    res.status(400).json(error.message);
    // else redirect 404
  }
});

router.get("/api/association/mission/:id", async (req, res): Promise<void> => {
  try {
    // gerer la notion de date n'affichier que les mission actuel ou a venir sauf cas authentification association see inside acrhiver

    const mission: IMissionSchema[] | null = await Mission.findById(req.params.id).populate(
      "association"
    );
    console.log("file: mission.routes.ts -> line 83 -> allMission", mission);

    if (mission === null) {
      throw new Error("mission not found");

      // TODO : redirect 404
    }
    res.status(200).json(mission);
  } catch (error: any) {
    res.status(404).json(error.message);
  }
});

router.get("/api/association/missions/:associationId", async (req, res): Promise<void> => {
  try {
    // gerer la notion de date n'affichier que les mission actuel ou a venir

    const allMissionOneAssociation: IMissionSchema[] | null = await Mission.find({
      association: req.params.associationId,
    }).populate("association");
    console.log("file: mission.routes.ts -> line 83 -> allMission", allMissionOneAssociation);

    if (allMissionOneAssociation === null) {
      res.status(200).json({ message: "empty mission for this association" });
    }
    res.status(200).json(allMissionOneAssociation);
  } catch (error: any) {
    res.status(404).json(error.message);
  }
});

router.delete(
  "/api/association/mission/delete/:id",
  associationAuthenticated,
  async (req, res): Promise<void> => {
    try {
      const mission: IMissionSchema[] | null = await Mission.findByIdAndDelete(req.params.id);
      if (!mission) {
        throw new Error("Mission not found");
      } else {
        res.json({ message: "Delete mission" });
      }
    } catch (error: any) {
      res.status(400).json({ message: "Error to delete mission" });
    }
  }
);

module.exports = router;
