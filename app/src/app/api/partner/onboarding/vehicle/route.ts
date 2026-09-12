import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import Vehicle from "@/src/models/vehicle.model";
import User from "@/src/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: Request) {
  try {
    await connectDb();
    const session = await auth();

    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const { type, number, vehicleModel } = await req.json();

    if (!type || !number || !vehicleModel) {
      return Response.json(
        { message: "Please provide all required vehicle details" },
        { status: 400 },
      );
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { owner: user._id },
      {
        owner: user._id,
        type,
        number: number.trim().toUpperCase(),
        vehicleModel: vehicleModel.trim(),
        status: "pending",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }
    user.partnerStatus = "pending";
    await user.save();

    return Response.json(
      {
        message: "Vehicle details saved successfully",
        vehicle,
        user,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Vehicle onboarding error:", error);
    if (error.code === 11000) {
      return Response.json(
        { message: "Vehicle number already registered" },
        { status: 400 },
      );
    }
    return Response.json(
      { message: "Failed to save vehicle details" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectDb();
    const session = await auth();

    if (!session || !session.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const vehicle = await Vehicle.findOne({ owner: user._id });

    return Response.json(
      {
        vehicle: vehicle || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get vehicle error:", error);
    return Response.json(
      { message: "Failed to get vehicle details" },
      { status: 500 },
    );
  }
}
