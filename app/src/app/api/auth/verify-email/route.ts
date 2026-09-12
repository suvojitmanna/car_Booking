import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";

export async function POST(req: Request) {
  try {
    await connectDb();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        { message: "Email and OTP are required!" },
        { status: 400 },
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ message: "User not found!" }, { status: 400 });
    }

    if (user.isEmailVerified) {
      return Response.json(
        { message: "Email is already verified!" },
        { status: 400 },
      );
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return Response.json({ message: "OTP has expired!" }, { status: 400 });
    }

    if (!user.otp || user.otp !== otp) {
      return Response.json({ message: "Invalid OTP!" }, { status: 400 });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    return Response.json(
      { message: "Email is verified successfully!" },
      { status: 200 },
    );
  } catch (error) {
    return Response.json(
      { message: `Verify email error: ${error}` },
      { status: 500 },
    );
  }
}
