import { auth } from "@/src/auth";
import uploadCloudinary from "@/src/lib/cloudinary";
import connectDb from "@/src/lib/db";
import PartnerDocs from "@/src/models/partnerDocs.model";
import User from "@/src/models/user.model";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const aadhar = formData.get("aadhar");
    const license = formData.get("license");
    const rc = formData.get("rc");

    if (
      !(aadhar instanceof File) ||
      !(license instanceof File) ||
      !(rc instanceof File)
    ) {
      return Response.json(
        { message: "All documents are required" },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024;

    const files = [
      { name: "Aadhar", file: aadhar },
      { name: "License", file: license },
      { name: "RC", file: rc },
    ];

    for (const item of files) {
      if (!allowedTypes.includes(item.file.type)) {
        return Response.json(
          { message: `${item.name} must be JPG, PNG or PDF` },
          { status: 400 },
        );
      }

      if (item.file.size > maxSize) {
        return Response.json(
          { message: `${item.name} must be less than 5MB` },
          { status: 400 },
        );
      }
    }

    const [aadharUrl, licenseUrl, rcUrl] = await Promise.all([
      uploadCloudinary(aadhar),
      uploadCloudinary(license),
      uploadCloudinary(rc),
    ]);

    if (!aadharUrl) {
      return Response.json(
        { message: "Aadhar upload failed" },
        { status: 500 },
      );
    }

    if (!licenseUrl) {
      return Response.json(
        { message: "License upload failed" },
        { status: 500 },
      );
    }

    if (!rcUrl) {
      return Response.json({ message: "RC upload failed" }, { status: 500 });
    }

    const updatePayload = {
      owner: user._id,
      aadharUrl,
      licenseUrl,
      rcUrl,
      status: "pending",
    };

    const partnerDocs = await PartnerDocs.findOneAndUpdate(
      { owner: user._id },
      { $set: updatePayload },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );
    if (user.partnerOnBoardingSteps < 2) {
      user.partnerOnBoardingSteps = 2;
      await user.save();
    }

    return Response.json(partnerDocs, {
      status: 200,
    });
  } catch (error) {
    console.error("Partner documents upload error:", error);
    return Response.json(
      {
        message: "Failed to upload partner documents",
      },
      { status: 500 },
    );
  }
}
