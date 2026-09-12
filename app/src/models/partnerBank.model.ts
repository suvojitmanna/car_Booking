import mongoose, { Document, Model } from "mongoose";

export interface IPartnerBank extends Document {
  owner: mongoose.Types.ObjectId;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  upi?: string;
  status: "not_added" | "added" | "verified";
  bankVerified?: boolean;
  verifyDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const partnerBankSchema = new mongoose.Schema<IPartnerBank>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    accountHolder: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },

    ifsc: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    upi: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["not_added", "added", "verified"],
      default: "not_added",
    },

    bankVerified: {
      type: Boolean,
      default: false,
    },

    verifyDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const PartnerBank: Model<IPartnerBank> =
  mongoose.models.PartnerBank ||
  mongoose.model<IPartnerBank>("PartnerBank", partnerBankSchema);

export default PartnerBank;
