// eslint-disable-next-line import/no-import-module-exports
import { Association, IAssociationSchema } from "../models/association.model";

const volunteerAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const bearerToken = req.headers.authorization.replace("Bearer ", "");

      const association: IAssociationSchema | null = await Association.findOne({
        token: bearerToken,
      });

      if (req.params.id) {
        if (association?.id !== req.params.id) {
          throw new Error("unauthorized");
        }
      }

      if (association) {
        req.association = association;
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
