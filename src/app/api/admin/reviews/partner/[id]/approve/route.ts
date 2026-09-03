import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import PartnerBank from "@/src/models/partnerBank.model";
import PartnerDocs from "@/src/models/partnerDocs.model";
import User from "@/src/models/user.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email || session.user?.role != "admin") {
      return Response.json({ message: "unauthorized", status: 400 });
    }
    await connectDb();
    const partnerId = (await context.params).id;
    const partner = await User.findById(partnerId);

    if (!partner || partner.role != "partner") {
      return Response.json({ message: "partner not found", status: 400 });
    }

    if (partner.partnerStatus == "approved") {
      return Response.json({
        message: "partner already approved",
        status: 200,
      });
    }

    const partnerDocs = await PartnerDocs.findOne({ owner: partner._id });
    const partnerBank = await PartnerBank.findOne({ owner: partner._id });

    if (!partnerDocs) {
      return Response.json({ message: "partner docs not found", status: 400 });
    }
    if (!partnerBank) {
      return Response.json({ message: "partner bank not found", status: 400 });
    }

    partner.partnerStatus = "approved";
    partner.partnerOnBoardingSteps = 4;
    await partner.save();

    partnerDocs.status = "approved";
    partnerDocs.verified = true;
    partnerDocs.verifyDate = new Date();
    await partnerDocs.save();

    partnerBank.status = "verified";
    partnerBank.bankVerified = true;
    partnerBank.verifyDate = new Date();
    await partnerBank.save();

    return Response.json({
      message: "partner approved successfully",
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      message: `error while approving partner${error}`,
      status: 500,
    });
  }
}
