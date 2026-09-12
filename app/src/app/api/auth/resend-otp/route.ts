import connectDb from "@/src/lib/db";
import { sendOtpEmail } from "@/src/lib/sendMail";
import User from "@/src/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    await connectDb();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 },
      );
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await user.save();

    const emailResult = await sendOtpEmail(email, user.name, otp);

    if (!emailResult.success) {
      return NextResponse.json(
        { message: "Failed to send OTP email" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "OTP resent successfully",
        email,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
