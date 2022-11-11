// eslint-disable-next-line import/no-import-module-exports
import { Volunteer, IVolunteerSchema } from "../models/volunteer.model";

const volunteerAuthenticated = async (req, res, next) => {
  console.log(req.fields);
try {
  if (req.headers.authorization) {
    const bearerToken = req.headers.authorization.replace("Bearer ", "");

    const volunteer: IVolunteerSchema | null = await Volunteer.findOne({ token: bearerToken });

    if (req.params.id && volunteer?.id !== req.params.id) {
      throw new Error("unauthorized");
    }

    if (volunteer) {
      req.volunteer = volunteer;
      next();
    } else {
      throw new Error("not exist token");
    }
  } else {
    throw new Error("not send token");
  }
} catch (error: any) {
  res.status(401).json(error.message);
}
};

module.exports = volunteerAuthenticated;
