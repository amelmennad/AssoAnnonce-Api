// eslint-disable-next-line import/no-import-module-exports
import { Volunteer, IVolunteerSchema } from "../models/volunteer.model";

const volunteerAuthenticated = async (req, res, next) => {
  console.log(req.fields);

  if (req.headers.authorization) {
    const bearerToken = req.headers.authorization.replace("Bearer ", "");

    const volunteer: IVolunteerSchema | null = await Volunteer.findOne({ token: bearerToken });

    if (req.params.id) {
      if (volunteer?.id !== req.params.id) {
        res.status(401).json({ error: "unauthorized" });
      }
    }
    if (volunteer) {
      req.volunteer = volunteer;
      next();
    } else {
      res.status(401).json({ error: "not exist token" });
    }
  } else {
    res.status(401).json({ error: "not send token" });
  }
};

module.exports = volunteerAuthenticated;
