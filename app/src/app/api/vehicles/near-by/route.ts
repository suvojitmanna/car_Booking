import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import Vehicle from "@/src/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { latitude, longitude, vehicleType } = await req.json();
    if (!latitude || !longitude || !vehicleType) {
      return NextResponse.json(
        { message: "Coordinates or vehicle type missing", vehicle: [] },
        { status: 400 },
      );
    }

    const lat = Number(latitude);
    const lon = Number(longitude);
    const type = String(vehicleType).toLowerCase().trim();
    const partners = await User.find({
      role: "partner",
      isOnline: true,
      partnerStatus: "approved",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
          $maxDistance: 5000,
        },
      },
    });

    const partnerIds = partners.map((p) => p._id);

    if (partnerIds.length === 0) {
      return NextResponse.json(
        {
          message: "No partner found near you",
          vehicle: [],
        },
        { status: 200 },
      );
    }

    const vehicle = await Vehicle.find({
      owner: { $in: partnerIds },
      type: type,
      status: "approved",
      $or: [{ isActive: true }, { isActive: { $exists: false } }],
    })
      .populate("owner", "name email mobileNumber profilePicture location")
      .lean();

    return NextResponse.json(
      {
        message: "Vehicle found nearby",
        vehicle: vehicle || [],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[NearBy API] Error finding nearby vehicles:", error);
    return NextResponse.json(
      { message: "nearby vehicle error", vehicle: [] },
      { status: 500 },
    );
  }
}
