// eslint-disable-next-line import/no-import-module-exports
import { Association } from "../models/association.model";
// eslint-disable-next-line import/no-import-module-exports
import { IMissionSchema, Mission } from "../models/mission.model";

const express = require("express");

const router = express.Router();

router.post("/api/association/mission/create", async (req, res): Promise<void> => {
  try {
    if (
      !req.fields.missionTitle ||
      !req.fields.place ||
      !req.fields.jobDescription ||
      !req.fields.startDate ||
      !req.fields.endDate ||
      !req.fields.association
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
      association,
    }: IMissionSchema = req.fields;

    const associationCheck = await Association.findById(association);

    const dateRegex: RegExp = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("date: not validated");
    }

    const nowTimestamp: Number = Date.now();
    const startDateTimestamp: Number = new Date(startDate).getTime();
    const endDateTimestamp: Number = new Date(endDate).getTime();

    if (
      startDateTimestamp < nowTimestamp ||
      endDateTimestamp < nowTimestamp ||
      startDateTimestamp > endDateTimestamp
    ) {
      throw new Error("date: not validated");
    }

    if (associationCheck === null) {
      res.status(401).json({ message: "unauthorized - association not exist" });
      // TODO : logout in front
    }

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
      association,
      timestamps: {
        createdAt: Date.now(),
      },
    });

    await newMission.save();

    res.status(200).json({ id: newMission.id });
    // res.status(200).json(newMission);
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});

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
      res.status(404).json({ message: "mission not found" });
      // TODO : redirect 404
    }
    res.status(200).json(mission);
  } catch (error: any) {
    res.status(400).json(error.message);
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
      // TODO : afficher message Aucune mission en cours
    }
    res.status(200).json(allMissionOneAssociation);
  } catch (error: any) {
    res.status(400).json(error.message);
  }
});


router.delete("/api/association/mission/:id", async (req, res): Promise<void> => {
  try {
    const mission: IMissionSchema[] | null = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) {
      res.status(404).json({ message: "Mission not found" });
    } else {
      return res.json({ message: "Delete mission" });
    }
  } catch (error: any) {
    res.status(400).json({ message: "Error to delete mission" });
  }
});

module.exports = router;
