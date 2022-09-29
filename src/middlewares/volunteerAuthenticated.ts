// eslint-disable-next-line import/no-import-module-exports
import { Volunteer, IVolunteerSchema } from "../models/volunteer.model";

const volunteerAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const bearerToken = req.headers.authorization.replace("Bearer ", "");

    const volunteer: IVolunteerSchema | null = await Volunteer.findOne({ token: bearerToken });

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
