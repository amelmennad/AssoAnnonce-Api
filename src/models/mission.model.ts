import mongoose, { Document, Schema } from "mongoose";

export interface IMissionSchema extends Document {
  missionTitle: string;
  place: string;
  jobDescription: string;
  startDate: string;
  endDate: string;
  groupedApplications: boolean;
  limiteGroupcandidacy: number;
  timestamps: {
    createdAt?: string;
    updatedAt?: string;
  };
}

const MissionSchema: Schema = new Schema<IMissionSchema>({
  missionTitle: { type: String, required: true, minlength: 20 },
  place: { type: String, required: true },
  jobDescription: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  groupedApplications: { type: Boolean, required: true },
  limiteGroupcandidacy: { type: Number },
  timestamps: {
    createdAt: String,
    updatedAt: String,
  },
});

export const Mission = mongoose.model<IMissionSchema>("Mission", MissionSchema);
