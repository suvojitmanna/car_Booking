import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import Vehicle from "@/src/models/vehicle.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Admin access only" },
        { status: 403 },
      );
    }

    const totalPartners = await User.countDocuments({ role: "partner" });

    const totalApprovePartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "approved",
    });

    const totalPendingPartners = await User.countDocuments({
      role: "partner",
      $or: [
        { partnerStatus: "pending" },
        { partnerStatus: { $exists: false } },
        { partnerStatus: null },
      ],
    });

    const totalRejectPartners = await User.countDocuments({
      role: "partner",
      partnerStatus: "rejected",
    });

    const pendingPartnerUsers = await User.find({
      role: "partner",
      $or: [
        { partnerStatus: "pending" },
        { partnerStatus: { $exists: false } },
        { partnerStatus: null },
      ],
      partnerOnBoardingSteps: { $gte: 3 },
    });

    const partnerIds = pendingPartnerUsers.map((user) => user._id);

    const partnerVehicle = await Vehicle.find({
      owner: { $in: partnerIds },
    });

    const vehicleTypeMap = new Map(
      partnerVehicle.map((v) => [String(v.owner), v.type]),
    );

    const pendingPartnersReviews = pendingPartnerUsers.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobile: user.mobileNumber || "",
      profilePicture: user.profilePicture || "",
      vehicleType: vehicleTypeMap.get(String(user._id)) || "Unknown",
    }));

    return NextResponse.json(
      {
        stats: {
          totalPartners,
          totalApprovePartners,
          totalPendingPartners,
          totalRejectPartners,
        },
        pendingPartnersReviews,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in admin dashboard API:", error);
    return NextResponse.json(
      { error: "Error in admin dashboard API" },
      { status: 500 },
    );
  }
}
