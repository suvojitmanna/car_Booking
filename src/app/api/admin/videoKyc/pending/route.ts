import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.email || session.user?.role != "admin") {
      return Response.json({ message: "unauthorized", status: 400 });
    }

    await connectDb();

    const partner = await User.find({
      role: "partner",
      partnerOnBoardingSteps:4,
      videoKycStatus: {
        $in: ["in_progress", "pending"],
      },
    });
    return Response.json(partner, { status: 200 });
  } catch (error) {
    console.log(error);
    return Response.json({
      message: `error while fetching users${error}`,
      status: 500,
    });
  }
}
