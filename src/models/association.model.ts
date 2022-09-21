import mongoose, { Document, Schema } from "mongoose";

export interface IAssociationSchema extends Document {
  role: string;
  status: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  token: string;
  powerDelegation: string;
  associationStatutes: string;
  interiorRules: string;
  secondaryEstablishment: boolean;
  rnaNumber: string;
  sirene: string;
  sireneNumber: string;
  associationName: string;
  objectAssociation: string;
  headOffice: string;
  joafePublication: string;
  publicUtility: boolean | string;
  publicUtilityNotification?: string;
  approvale: boolean | string;
  approvaleCertificate?: string;
  needInsurance: boolean | string;
  insuranceCopy?: string;
  alsaceMoselleLaw: boolean;
  description?: string;
  avatar?: string;
  timestamps: {
    createdAt?: string;
    updatedAt?: string;
  };
}

const AssociationSchema: Schema = new Schema<IAssociationSchema>({
  role: { type: String, required: true, default: "association" },
  status: { type: String, required: true, default: "pending" },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  token: { type: String, required: true },
  powerDelegation: { type: String, required: true },
  associationStatutes: { type: String, required: true },
  interiorRules: { type: String, required: true },
  secondaryEstablishment: { type: Boolean, required: true },

  rnaNumber: { type: String, required: true },
  sirene: { type: String, required: true },
  sireneNumber: { type: String, required: true },
  associationName: { type: String, required: true },
  objectAssociation: { type: String, required: true },
  headOffice: { type: String, required: true },
  joafePublication: { type: String, required: true },
  publicUtility: { type: Boolean, required: true },
  publicUtilityNotification: String,
  approvale: { type: Boolean, required: true },
  approvaleCertificate: String,
  needInsurance: { type: Boolean, required: true },
  insuranceCopy: String,
  alsaceMoselleLaw: { type: Boolean, required: true },
  description: String,
  avatar: String,
  timestamps: {
    createdAt: String,
    updatedAt: String,
  },
});

export const Association = mongoose.model<IAssociationSchema>("Association", AssociationSchema);
