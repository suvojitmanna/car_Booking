import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password,image } = await req.json();
    await connectDb();
    let user = await User.findOne({ email });
    if (user) {
      return NextResponse.json(
        { message: "email already exist!" },
        { status: 400 },
      );
    }
    if (password.length<6) {
      return NextResponse.json(
        { message: "password must be 6 character" },
        { status: 400 },
      );
    }
    const hashedPassword = await bcrypt.hash(password,10)

    user = await User.create({
        name,email,image,password:hashedPassword
    })
    return NextResponse.json(
        user,
        { status: 200 },
      );
  } catch (error) {
    return NextResponse.json(
        { message: `register error ${error}` },
        { status: 500 },
      );
  }
}
