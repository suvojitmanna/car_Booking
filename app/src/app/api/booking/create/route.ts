import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import Booking from "@/src/models/booking.model";
import User from "@/src/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ message: "un-authorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      driver,
      vehicleId,
      pickUpAddress,
      dropAddress,
      pickupLocation,
      pickUpLocation,
      dropLocation,
      fare,
      userMobileNumber,
      mobileNumber,
    } = body;

    const activePickupLoc = pickupLocation || pickUpLocation;

    if (!activePickupLoc?.coordinates || !dropLocation?.coordinates) {
      return NextResponse.json(
        { message: "Missing pickup or drop location coordinates" },
        { status: 400 },
      );
    }

    const existing = await Booking.findOne({
      user: session.user.id,
      bookingStatus: {
        $in: ["requested", "confirmed", "awaiting_payment", "started"],
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const isDriverValid = driver && mongoose.Types.ObjectId.isValid(driver);
    const isVehicleValid =
      vehicleId && mongoose.Types.ObjectId.isValid(vehicleId);

    const [userDoc, driverDoc] = await Promise.all([
      User.findById(session.user.id).catch(() => null),
      isDriverValid ? User.findById(driver).catch(() => null) : null,
    ]);

    const finalUserMobile =
      userMobileNumber || mobileNumber || userDoc?.mobileNumber || "";
    const finalDriverMobile = driverDoc?.mobileNumber || "";

    const booking = await Booking.create({
      user: session.user.id,
      driver: isDriverValid ? driver : undefined,
      vehicle: isVehicleValid ? vehicleId : undefined,
      pickUpAddress: pickUpAddress || "Pickup Address",
      dropAddress: dropAddress || "Drop Address",
      pickUpLocation: {
        type: "Point",
        coordinates: activePickupLoc.coordinates,
      },
      dropLocation: {
        type: "Point",
        coordinates: dropLocation.coordinates,
      },
      fare: Number(fare) || 0,
      userMobileNumber: String(finalUserMobile),
      driverMobileNumber: String(finalDriverMobile),
      bookingStatus: "requested",
      paymentStatus: "pending",
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
