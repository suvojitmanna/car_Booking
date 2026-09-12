import connectDb from "@/src/lib/db";
import { auth } from "@/src/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/src/models/vehicle.model";
import User from "@/src/models/user.model";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.email || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "You are not authorize to access this API" },
        { status: 400 },
      );
    }
    await connectDb();
    const vehicleId = (await context.params).id;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return NextResponse.json(
        { message: "No vehicle found" },
        { status: 400 },
      );
    }

    vehicle.status = "approved";
    vehicle.rejectionReason = undefined;
    await vehicle.save();

    const partner = await User.findById(vehicle.owner);

    if (!partner) {
      return NextResponse.json(
        { message: "Partner not found" },
        { status: 400 },
      );
    }

    partner.partnerOnBoardingSteps = 7;
    await partner.save();

    return NextResponse.json({ message: "Vehicle approved" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Vehicle could not be approved" },
      { status: 500 },
    );
  }
}
