import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDb();

    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required!" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { message: "Invalid email or password!" },
        { status: 401 }
      );
    }

    if (!user.isEmailVerified) {
      return Response.json(
        { message: "Please verify your email first!" },
        { status: 400 }
      );
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return Response.json(
        { message: "Invalid email or password!" },
        { status: 401 }
      );
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    // TODO: Send OTP through email
    console.log("LOGIN OTP:", otp);

    return Response.json(
      {
        success: true,
        message: "Login OTP sent successfully!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login OTP error:", error);

    return Response.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}