import mongoose, { Document, Model } from "mongoose";

interface IPartnerDocs extends Document {
  owner: mongoose.Types.ObjectId;
  aadharUrl: string;
  rcUrl: string;
  licenseUrl: string;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partnerDocSchema = new mongoose.Schema<IPartnerDocs>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    aadharUrl: {
      type: String,
      required: true,
    },
    rcUrl: {
      type: String,
      required: true,
    },
    licenseUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const PartnerDocs =
  mongoose.models.PartnerDocs ||
  mongoose.model("PartnerDocs", partnerDocSchema);

export default PartnerDocs;