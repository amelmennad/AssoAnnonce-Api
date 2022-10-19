// eslint-disable-next-line import/no-import-module-exports
import { Association, IAssociationSchema } from "../models/association.model";

const volunteerAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const bearerToken = req.headers.authorization.replace("Bearer ", "");

    const association: IAssociationSchema | null = await Association.findOne({
      token: bearerToken,
    });

    if (association) {
      req.association = association;
      next();
    } else {
      res.status(401).json({ error: "not exist token" });
    }
  } else {
    res.status(401).json({ error: "not send token" });
  }
};

module.exports = volunteerAuthenticated;
