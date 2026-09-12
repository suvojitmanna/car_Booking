import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email || session.user?.role !== "admin") {
      return NextResponse.json({ message: "Not authorize" }, { status: 400 });
    }

    await connectDb();
    const partnerId = (await context.params).id;
    const partner = await User.findById(partnerId);

    if (!partner || partner.role !== "partner") {
      return NextResponse.json(
        { message: "Partner not found or invalid role" },
        { status: 400 },
      );
    }

    const roomId = `kyc-${partner._id}-${Date.now()}`;
    partner.videoKycStatus = "in_progress";
    partner.videoKycRoomId = roomId;
    partner.partnerOnBoardingSteps = 4;

    await partner.save();

    return NextResponse.json({ roomId });
  } catch (error) {
    return NextResponse.json(
      { message: `Internal server error${error}` },
      { status: 500 },
    );
  }
}
