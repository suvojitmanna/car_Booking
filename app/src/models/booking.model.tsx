import mongoose from "mongoose";

type BookingStatus =
  | ["requested"]
  | "awaiting_payment"
  | "confirmed"
  | "started"
  | "completed"
  | "cancelled"
  | "rejected"
  | "expired";

type PaymentStatus = "pending" | "paid" | "cash" | "failed";

export interface IBooking {
  user: mongoose.Types.ObjectId;
  driver: mongoose.Types.ObjectId;
  vehicle: mongoose.Types.ObjectId;
  pickUpAddress: string;
  dropAddress: string;

  pickUpLocation: {
    type: "point";
    coordinates: [number, number];
  };
  dropLocation: {
    type: "point";
    coordinates: [number, number];
  };

  fare: number;
  userMobileNumber: number;
  driverMobileNumber: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;

  adminCommission: number;
  partnerAmount: number;
  pickUpOtp: string;
  pickUpOtpExpired: Date;
  dropOtp: string;
  dropOtpExpired: Date;
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
      ref: "Driver",
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    pickUpAddress: {
      type: String,
      required: true,
    },
    dropAddress: {
      type: String,
      required: true,
    },
    pickUpLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    dropLocation: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    fare: {
      type: Number,
      required: true,
    },
    userMobileNumber: {
      type: Number,
      required: true,
    },
    driverMobileNumber: {
      type: Number,
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: [
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
    adminCommission: {
      type: Number,
      default: 0,
      required: true,
    },
    partnerAmount: {
      type: Number,
      default: 0,
      required: true,
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
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
