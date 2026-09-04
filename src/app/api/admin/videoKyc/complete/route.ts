import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || !session.user?.email || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "unauthenticated user" },
        { status: 401 },
      );
    }

    const { roomId, action, reason } = await req.json();

    if (!roomId || !action) {
      return NextResponse.json(
        { message: "roomId and action are required" },
        { status: 400 },
      );
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ message: "invalid action" }, { status: 400 });
    }

    let partner = await User.findOne({
      videoKycRoomId: roomId,
      role: "partner",
    });

    if (!partner && roomId.startsWith("kyc-")) {
      const parts = roomId.split("-");
      if (parts[1]) {
        partner = await User.findById(parts[1]);
      }
    }

    if (!partner) {
      return NextResponse.json({ message: "partner not found" }, { status: 404 });
    }

    if (action === "approved") {
      partner.videoKycStatus = "approved";
      partner.videoKycRejectionReason = undefined;
      partner.partnerOnBoardingSteps = 5;
    }

    if (action === "rejected") {
      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { message: "reason is required" },
          { status: 400 },
        );
      }
      partner.videoKycStatus = "rejected";
      partner.videoKycRejectionReason = reason.trim();
    }

    await partner.save();
    return NextResponse.json({ status: partner.videoKycStatus }, { status: 200 });
  } catch (error) {
    console.error("Video KYC complete error:", error);
    return NextResponse.json({ message: "internal server error" }, { status: 500 });
  }
}
