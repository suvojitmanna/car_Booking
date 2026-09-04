import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDb();
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    }

    const partner = await User.findOne({ email: session.user.email });

    if (!partner) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    if (partner.videoKycStatus !== "rejected") {
      return NextResponse.json(
        { message: "you cannot send video kyc request" },
        { status: 400 },
      );
    }

    partner.videoKycStatus = "pending";
    partner.videoKycRejectionReason = undefined;
    partner.videoKycRoomId = undefined;

    await partner.save();

    return NextResponse.json(
      { message: "video kyc request sent" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Video KYC request error:", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
