import connectDb from "@/src/lib/db";
import { auth } from "@/src/auth";
import { NextRequest, NextResponse } from "next/server";
import Vehicle from "@/src/models/vehicle.model";

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
    const vehicle = await Vehicle.findById(vehicleId).populate('owner');

    if (!vehicle) {
      return NextResponse.json(
        { message: "No vehicle found" },
        { status: 400 },
      );
    }
    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error in admin reviews vehicles API" },
      { status: 500 },
    );
  }
}
