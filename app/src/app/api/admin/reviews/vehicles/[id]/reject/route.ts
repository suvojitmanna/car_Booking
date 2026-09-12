import connectDb from "@/src/lib/db";
import { auth } from "@/src/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/src/models/vehicle.model";

export async function POST(
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

    const {reason} = await request.json();

    if(!reason){
      return NextResponse.json(
        { error: "Please provide rejection reason" },
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

    vehicle.status = "rejected";
    vehicle.rejectionReason = reason;
    await vehicle.save();

    return NextResponse.json({ message: "Vehicle rejected" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Vehicle could not be rejected" },
      { status: 500 },
    );
  }
}
