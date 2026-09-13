import mongoose from "mongoose";

export type BookingStatus =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

export type PaymentStatus = "pending" | "paid" | "cash" | "failed";

export interface IBooking {
  user: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  vehicle?: mongoose.Types.ObjectId;
  pickUpAddress: string;
  dropAddress: string;

  pickUpLocation?: {
    type: "Point";
    coordinates: [number, number];
  };
  dropLocation?: {
    type: "Point";
    coordinates: [number, number];
  };

  fare: number;
  userMobileNumber?: string;
  driverMobileNumber?: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentDeadline?:Date

  adminCommission?: number;
  partnerAmount?: number;
  pickUpOtp?: string;
  pickUpOtpExpired?: Date;
  dropOtp?: string;
  dropOtpExpired?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
    },
    pickUpAddress: {
      type: String,
      default: "",
    },
    dropAddress: {
      type: String,
      default: "",
    },
    pickUpLocation: {
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
    dropLocation: {
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
    fare: {
      type: Number,
      default: 0,
    },
    userMobileNumber: {
      type: String,
      default: "",
    },
    driverMobileNumber: {
      type: String,
      default: "",
    },
    bookingStatus: {
      type: String,
      enum: [
        "idle",
        "requested",
        "awaiting_payment",
        "confirmed",
        "started",
        "completed",
        "cancelled",
        "rejected",
        "expired",
      ],
      default: "requested",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cash", "failed"],
      default: "pending",
    },
    paymentDeadline: {
      type: Date,
    },
    adminCommission: {
      type: Number,
      default: 0,
    },
    partnerAmount: {
      type: Number,
      default: 0,
    },
    pickUpOtp: {
      type: String,
    },
    pickUpOtpExpired: {
      type: Date,
    },
    dropOtp: {
      type: String,
    },
    dropOtpExpired: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
