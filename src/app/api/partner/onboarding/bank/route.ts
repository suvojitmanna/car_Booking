import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import PartnerBank from "@/src/models/partnerBank.model";
import User from "@/src/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const { accountHolder, accountNumber, ifsc, upi, mobileNumber } =
      await req.json();

    if (!accountHolder || !accountNumber || !ifsc || !mobileNumber) {
      return Response.json(
        { message: "Please provide all required bank details" },
        { status: 400 },
      );
    }

    const partnerBank = await PartnerBank.findOneAndUpdate(
      { owner: user._id },
      {
        owner: user._id,
        accountHolder: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        ifsc: ifsc.trim().toUpperCase(),
        upi: upi?.trim() || "",
        status: "added",
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    user.mobileNumber = mobileNumber.trim();

    if (user.partnerOnBoardingSteps < 3) {
      user.partnerOnBoardingSteps = 3;
    }

    await user.save();
    return Response.json(
      {
        message: "Bank details saved successfully",
        partnerBank,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Partner bank error:", error);
    return Response.json(
      { message: "Failed to save bank details" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const partnerBank = await PartnerBank.findOne({ owner: user._id });

    if (!partnerBank) {
      return Response.json(
        {
          partnerBank: null,
          message: "Bank details not found",
        },
        { status: 200 },
      );
    }

    return Response.json(
  {
    partnerBank: {
      id: partnerBank._id,
      accountHolder: partnerBank.accountHolder,
      accountNumber: partnerBank.accountNumber,
      ifsc: partnerBank.ifsc,
      upi: partnerBank.upi,
      mobileNumber: user.mobileNumber || "",
      status: partnerBank.status,
    },
  },
  { status: 200 },
);

  } catch (error) {
    console.error("Get partner bank error:", error);
    return Response.json(
      {
        message: "Failed to get bank details",
      },
      { status: 500 },
    );
  }
}
