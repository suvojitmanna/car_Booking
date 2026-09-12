import mongoose, { Document, Model } from "mongoose";

type VideoKycStatus =
  | "not_required"
  | "pending"
  | "in_progress"
  | "approved"
  | "rejected";

export interface IUser extends Document {
  name: string;
  email: string;
  profilePicture?: string;
  password?: string;
  otp?: string;
  role: "user" | "partner" | "admin";
  isEmailVerified?: boolean;
  otpExpiresAt?: Date;
  partnerOnBoardingSteps: number;
  mobileNumber: string;
  partnerStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  videoKycStatus: VideoKycStatus;
  videoKycRoomId?: string;
  videoKycRejectionReason?: string;
  socketId: string;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  isOnline: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
      enum: ["user", "partner", "admin"],
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    mobileNumber: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    partnerOnBoardingSteps: {
      type: Number,
      min: 0,
      max: 8,
      default: 0,
    },
    partnerStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "approved", "rejected"],
    },
    rejectionReason: {
      type: String,
    },
    videoKycStatus: {
      type: String,
      default: "not_required",
      enum: ["not_required", "pending", "in_progress", "approved", "rejected"],
    },
    videoKycRoomId: {
      type: String,
    },
    videoKycRejectionReason: {
      type: String,
    },
    socketId: {
      type: String,
      default: "",
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", function () {
  if (
    !this.location ||
    this.location.type !== "Point" ||
    !Array.isArray(this.location.coordinates) ||
    this.location.coordinates.length !== 2
  ) {
    this.location = {
      type: "Point",
      coordinates: [0, 0],
    };
  }
});

userSchema.index({ location: "2dsphere" });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
