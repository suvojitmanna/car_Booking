import connectDb from "@/src/lib/db";
import Booking from "@/src/models/booking.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { message: "Booking id is required" },
        { status: 404 },
      );
    }

    await connectDb();
    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 },
      );
    }
    if (booking.bookingStatus !== "requested") {
      return NextResponse.json(
        { message: "Booking is not in requested state" },
        { status: 400 },
      );
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    return NextResponse.json(
      { success: true, message: "Booking cancelled successfully", booking },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
