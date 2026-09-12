import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import PartnerBank from "@/src/models/partnerBank.model";
import PartnerDocs from "@/src/models/partnerDocs.model";
import User from "@/src/models/user.model";
import Vehicle from "@/src/models/vehicle.model";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();

    if (!session || !session.user?.email || session.user.role != "admin") {
      return Response.json({ message: "unauthorized", status: 400 });
    }
    await connectDb();
    const partnerId = (await context.params).id;
    const partner = await User.findById(partnerId);

    if (!partner || partner.role != "partner") {
      return Response.json({ message: "partner not found", status: 400 });
    }

    const vehicle = await Vehicle.findOne({ owner: partnerId });
    const document = await PartnerDocs.findOne({ owner: partnerId });
    const bank = await PartnerBank.findOne({ owner: partnerId });

    return Response.json(
      {
        partner: partner || null,
        vehicle: vehicle || null,
        document: document || null,
        bank: bank || null,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error);
    return Response.json(
      { message: `Error fetching partner data: ${error}` },
      { status: 500 },
    );
  }
}
