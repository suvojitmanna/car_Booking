import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import Booking from "@/src/models/booking.model";
import User from "@/src/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ booking: null }, { status: 200 });
    }

    const user = await User.findOne({ email: session.user.email });

    const booking = await Booking.findOne({
      user: user?._id,
      bookingStatus: {
        $in: ["requested", "awaiting_payment", "confirmed", "started"],
      },
    });

    return NextResponse.json({booking}, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
