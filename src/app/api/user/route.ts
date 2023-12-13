import authOptions from "@/lib/auth";
import initMongoose from "@/lib/db/db";
import User from "@/model/user";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

interface ReqType {
  username?: string;
  email?: string;
  password?: string;
  image?: string;
}

export async function PATCH(req: NextRequest, res: NextResponse) {
  const { password, email, ...rest }: ReqType = await req.json();

  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 403 });
  }

  try {
    await initMongoose();
  } catch (e) {
    return NextResponse.json(
      { message: "Failed connecting to DB" },
      { status: 500 }
    );
  }

  const repeatUsername = await User.findOne({ username: rest.username });
  if (repeatUsername) {
    {
      return NextResponse.json(
        { message: "User with this username already exists" },
        { status: 400 }
      );
    }
  }

  try {
    await User.findByIdAndUpdate(session.user._id, rest);
  } catch (e) {
    return NextResponse.json(
      { message: "Failed updating the user" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Registered successfully" },
    { status: 200 }
  );
}
