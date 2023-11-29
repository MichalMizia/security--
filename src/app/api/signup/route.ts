import { NextRequest, NextResponse } from "next/server";
import initMongoose from "@/lib/db/db";
import User from "@/model/user";
import * as bcrypt from "bcrypt";

interface ReqType {
  username: string;
  email: string;
  password: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { username, email, password }: ReqType = await req.json();

  try {
    await initMongoose();
  } catch (e) {
    console.log("Mongoose error: ", e);
    return NextResponse.json(
      { message: "Failed connecting to DB" },
      { status: 500 }
    );
  }

  if (
    !username ||
    !username.length ||
    !email ||
    !email.length ||
    !password ||
    !password.length
  ) {
    return NextResponse.json(
      { message: "Submitted with incorrect data" },
      { status: 400 }
    );
  }

  const repeatEmail = await User.findOne({ email: email });
  if (repeatEmail) {
    {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 400 }
      );
    }
  }

  const repeatUsername = await User.findOne({ email: email });
  if (repeatUsername) {
    {
      return NextResponse.json(
        { message: "User with this username already exists" },
        { status: 400 }
      );
    }
  }

  // 10 is the number of salt rounds
  const hashedPwd = await bcrypt.hash(password, 10);

  try {
    await User.create({ username, email, password: hashedPwd });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed creating the new user" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Registered successfully" },
    { status: 200 }
  );
}
