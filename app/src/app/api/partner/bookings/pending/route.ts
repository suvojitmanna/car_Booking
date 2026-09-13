import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import Booking from "@/src/models/booking.model";
import User from "@/src/models/user.model";
import Vehicle from "@/src/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorised" }, { status: 401 });
    }

    const partner = await User.findOne({ email: session.user.email });
    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 400 },
      );
    }

    const userVehicles = await Vehicle.find({ owner: partner._id }).select(
      "_id",
    );
    const vehicleIds = userVehicles.map((v) => v._id);

    const bookings = await Booking.find({
      $or: [{ driver: partner._id }, { vehicle: { $in: vehicleIds } }],
      bookingStatus: "requested",
    })
      .populate("user", "name email mobileNumber image")
      .populate("vehicle")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, bookings }, { status: 200 });
  } catch (e: any) {
    console.error("Fetch pending bookings failed:", e);
    return NextResponse.json(
      { message: "Fetch pending bookings failed", error: e?.message },
      { status: 500 },
    );
  }
}
