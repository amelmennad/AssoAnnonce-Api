import mongoose, { Document, Schema } from "mongoose";

export interface IVolunteerSchema extends Document {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  salt: string;
  token: string;
  cgu: boolean;
  birthday: string;
  avatar?: string;
  aboutme?: string;
  timestamps: {
    createdAt?: string;
    updatedAt?: string;
  };
}

const VolunteerSchema: Schema = new Schema<IVolunteerSchema>({
  role: { type: String, required: true, default: "volunteer" },
  firstName: { type: String, required: true, minlength: 3 },
  lastName: { type: String, required: true, minlength: 3 },
  email: { type: String, required: true },
  password: { type: String, required: true, minlength: 8 },
  salt: { type: String, required: true },
  token: { type: String, required: true },
  cgu: { type: Boolean, require: true },
  birthday: { type: String, require: true },
  avatar: String,
  aboutme: String,
  timestamps: {
    createdAt: String,
    updatedAt: String,
  },
});

export const Volunteer = mongoose.model<IVolunteerSchema>("Volunteer", VolunteerSchema);
