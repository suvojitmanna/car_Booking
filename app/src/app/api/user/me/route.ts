import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";

import PartnerDocs from "@/src/models/partnerDocs.model";
import Vehicle from "@/src/models/vehicle.model";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json(
        { message: "user is not authenticated" },
        { status: 401 },
      );
    }

    await connectDb();

    const user: any = await User.findOne({
      email: session.user.email,
    }).lean();

    if (!user) {
      return Response.json({ message: "user is not found" }, { status: 404 });
    }

    if (
      user.partnerStatus === "rejected" &&
      (!user.rejectionReason || !user.rejectionReason.trim())
    ) {
      const [partnerDocs, vehicle] = await Promise.all([
        PartnerDocs.findOne({ owner: user._id }).lean(),
        Vehicle.findOne({ owner: user._id }).lean(),
      ]);

      const fallbackReason =
        (partnerDocs as any)?.rejectionReason ||
        (vehicle as any)?.rejectionReason;
        
      if (fallbackReason && fallbackReason.trim()) {
        user.rejectionReason = fallbackReason.trim();
        await User.findByIdAndUpdate(user._id, {
          $set: { rejectionReason: user.rejectionReason },
        });
      }
    }

    return Response.json(user, {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return Response.json({ message: "get me error" }, { status: 500 });
  }
}
