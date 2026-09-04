import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import PartnerDocs from "@/src/models/partnerDocs.model";
import Vehicle from "@/src/models/vehicle.model";
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

    const reason =
      rejectionReason && typeof rejectionReason === "string" && rejectionReason.trim().length > 0
        ? rejectionReason.trim()
        : "Application details did not meet the verification requirements.";

    const updatedPartner = await User.findByIdAndUpdate(
      partnerId,
      {
        $set: {
          partnerStatus: "rejected",
          rejectionReason: reason,
          partnerOnBoardingSteps: 3,
        },
      },
      { new: true },
    );

    await PartnerDocs.findOneAndUpdate(
      { owner: partner._id },
      { $set: { status: "rejected", rejectionReason: reason } },
    );

    await Vehicle.findOneAndUpdate(
      { owner: partner._id },
      { $set: { status: "rejected", rejectionReason: reason } },
    );

    return Response.json({
      message: "partner rejected successfully",
      status: 200,
      partner: updatedPartner,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      message: `error while rejecting partner: ${error}`,
      status: 500,
    });
  }
}
