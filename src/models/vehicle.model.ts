import mongoose, { Document, Model } from "mongoose";

type VehicleType = "bike" | "car" | "loading" | "truck" | "auto";

interface IVehicle extends Document {
  owner: mongoose.Types.ObjectId;
  type: VehicleType;
  vehicleModel: string;
  number: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKM?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new mongoose.Schema<IVehicle>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["bike", "car", "loading", "truck", "auto"],
      required: true,
    },

    vehicleModel: {
      type: String,
      required: true,
    },

    number: {
      type: String,
      unique: true,
      required: true,
    },

    imageUrl: {
      type: String,
    },

    baseFare: {
      type: Number,
      default: 0,
    },

    pricePerKM: {
      type: Number,
    },

    waitingCharge: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
    },

    rejectionReason: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Vehicle =
  mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
