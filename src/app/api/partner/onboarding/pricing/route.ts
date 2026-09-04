import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import uploadToCloudinary from "@/src/lib/cloudinary";
import User from "@/src/models/user.model";
import Vehicle from "@/src/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const partner = await User.findOne({ email: session.user.email });

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "partner not found" },
        { status: 403 },
      );
    }

    const vehicle = await Vehicle.findOne({ owner: partner._id });
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 },
      );
    }

    const formData = await req.formData();
    const image = formData.get("image") as File | null;
    const baseFare = formData.get("baseFare") as string | null;
    const perKm = formData.get("perKm") as string | null;
    const waitingCharge = formData.get("waitingCharge") as string | null;

    let updated = false;

    if (image && typeof image === "object" && "size" in image && image.size > 0) {
      try {
        const imageUrl = await uploadToCloudinary(image);
        if (imageUrl) {
          vehicle.imageUrl = imageUrl;
          updated = true;
        }
      } catch (imgErr) {
        console.error("Cloudinary upload error:", imgErr);
      }
    }

    if (baseFare !== undefined && baseFare !== null && String(baseFare).trim() !== "") {
      vehicle.baseFare = Number(baseFare);
      updated = true;
    }

    if (perKm !== undefined && perKm !== null && String(perKm).trim() !== "") {
      vehicle.pricePerKM = Number(perKm);
      updated = true;
    }

    if (waitingCharge !== undefined && waitingCharge !== null && String(waitingCharge).trim() !== "") {
      vehicle.waitingCharge = Number(waitingCharge);
      updated = true;
    }

    if (!updated) {
      return NextResponse.json({ message: "No updates provided" }, { status: 400 });
    }

    vehicle.status = "pending";
    vehicle.rejectionReason = undefined;
    await vehicle.save();

    partner.partnerOnBoardingSteps = 6;
    await partner.save();

    return NextResponse.json(
      { message: "Pricing updated successfully", vehicle },
      { status: 200 },
    );
  } catch (error) {
    console.error("Pricing route error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const partner = await User.findOne({ email: session.user.email });

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "partner not found" },
        { status: 403 },
      );
    }

    const vehicle = await Vehicle.findOne({ owner: partner._id });
    if (!vehicle) {
      return NextResponse.json(
        { message: "Vehicle not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ vehicle }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: `Something went wrong ${error}` },
      { status: 500 },
    );
  }
}
