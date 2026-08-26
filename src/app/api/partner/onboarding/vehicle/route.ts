import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import Vehicle from "@/src/models/vehicle.model.ts";
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
        { message: "Missing required details" },
        { status: 400 },
      );
    }

    const vehicleNumber = String(number).trim().toUpperCase();

    const duplicate = await Vehicle.findOne({
      number: vehicleNumber,
      owner: { $ne: user._id },
    });

    if (duplicate) {
      return Response.json(
        { message: "Vehicle number already registered" },
        { status: 409 },
      );
    }

    let vehicle = await Vehicle.findOne({ owner: user._id });
    if (vehicle) {
      vehicle.type = type;
      vehicle.number = vehicleNumber;
      vehicle.vehicleModel = vehicleModel;
      vehicle.status = "pending";

      await vehicle.save();
      return Response.json(vehicle, { status: 200 });
    }

    vehicle = await Vehicle.create({
      owner: user._id,
      type,
      number: vehicleNumber,
      vehicleModel,
      status: "pending",
    });

    if (user.partnerOnBoardingSteps < 1) {
      user.partnerOnBoardingSteps = 1;
    }

    user.role = "partner";
    await user.save();

    return Response.json(vehicle, {
      status: 201,
    });
  } catch (error: any) {
    console.error("VEHICLE ERROR:", error);

    return Response.json(
      {
        message: error?.message || "Failed to save vehicle",
        code: error?.code,
        keyValue: error?.keyValue,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
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

    return Response.json({ vehicle: vehicle ?? null }, { status: 200 });
  } catch (error) {
    console.error("Get vehicle error:", error);

    return Response.json({ message: "Failed to get vehicle" }, { status: 500 });
  }
}
