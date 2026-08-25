import { auth } from "@/src/auth";
import connectDb from "@/src/lib/db";
import User from "@/src/models/user.model";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json(
        { message: "user is not authenticated" },
        { status: 401 },
      );
    }

    await connectDb();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return Response.json({ message: "user is not found" }, { status: 404 });
    }

    return Response.json(user, { status: 200 });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    return Response.json({ message: "get me error" }, { status: 500 });
  }
}
