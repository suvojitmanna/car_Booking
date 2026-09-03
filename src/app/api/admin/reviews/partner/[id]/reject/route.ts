import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email || session.user?.role != "admin") {
      return Response.json({ message: "unauthorized", status: 400 });
    }
    await connectDb();
    const { rejectionReason } = await req.json();
    const partnerId = (await context.params).id;
    const partner = await User.findById(partnerId);

    if (!partner || partner.role != "partner") {
      return Response.json({ message: "partner not found", status: 400 });
    }

    if (
      partner.partnerStatus === "approved" ||
      partner.partnerStatus === "rejected"
    ) {
      return Response.json({
        message: "partner already approved or rejected",
        status: 400,
      });
    }

    partner.partnerStatus = "rejected";
    partner.rejectionReason = rejectionReason;
    await partner.save();

    return Response.json({
      message: "partner rejected successfully",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      message: `error while rejecting partner${error}`,
      status: 500,
    });
  }
}
