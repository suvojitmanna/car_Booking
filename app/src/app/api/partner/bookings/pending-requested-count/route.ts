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

    if (!session?.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const partner = await User.findOne({
      email: session.user.email,
    });

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

    const count = await Booking.countDocuments({
      $or: [{ driver: partner._id }, { vehicle: { $in: vehicleIds } }],
      bookingStatus: "requested",
    });

    return NextResponse.json({ count }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch pending requests count error:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
