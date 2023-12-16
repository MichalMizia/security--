import User, { IUser } from "@/model/user";
import initMongoose from "@/lib/db/db";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendResetPasswordEmail } from "./sendResetPasswordEmail";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/auth";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    await initMongoose();
  } catch (e) {
    console.log("Failed connecting to database: ", e);
    return NextResponse.json(
      { message: "Failed connecting to database" },
      { status: 500 }
    );
  }

  // verify the session
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json(
      { message: "Unauthorized, log in first" },
      { status: 403 }
    );
  }

  try {
    const user: IUser | null = await User.findById(session.user._id);

    if (!user) {
      return NextResponse.json({ message: "No such user" }, { status: 400 });
    }

    const email = user.email;

    const secret: string | undefined = process.env.RESET_TOKEN_SECRET;

    if (!secret) {
      throw new Error("Reset token secret key was not defined");
    }

    const user_token = jwt.sign({ id: user._id }, secret, {
      expiresIn: "1h",
    });

    const url = `${process.env.BASE_URL}/upload-face/${user_token}/${user._id}`;

    await sendResetPasswordEmail(email, url);
  } catch (e) {
    console.log(e);
    return NextResponse.json({}, { status: 400 });
  }
  return NextResponse.json({ message: "success" }, { status: 200 });
}
