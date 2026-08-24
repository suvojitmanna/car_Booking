import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectDb();

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return Response.json(
        { message: "Email and OTP are required!" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { message: "User not found!" },
        { status: 404 }
      );
    }

    if (!user.otp || user.otp !== otp) {
      return Response.json(
        { message: "Invalid OTP!" },
        { status: 400 }
      );
    }

    if (
      !user.otpExpiresAt ||
      user.otpExpiresAt < new Date()
    ) {
      return Response.json(
        { message: "OTP has expired!" },
        { status: 400 }
      );
    }

    // Clear OTP
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    // Create JWT
    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const response = Response.json(
      {
        success: true,
        message: "Login successful!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
      },
      { status: 200 }
    );

    response.headers.set(
      "Set-Cookie",
      `auth_token=${token}; HttpOnly; Path=/; Max-Age=${
        7 * 24 * 60 * 60
      }; SameSite=Lax`
    );

    return response;
  } catch (error) {
    console.error("Verify login OTP error:", error);

    return Response.json(
      { message: "Something went wrong!" },
      { status: 500 }
    );
  }
}