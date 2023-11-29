import { ObjectId } from "mongoose";
import authOptions from "@/lib/auth";
import initMongoose from "@/lib/db/db";
import { DocumentModel } from "@/model/document";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

interface ReqType {
  title: string;
  description: string;
  category: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { title, description, category }: ReqType = await req.json();

  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session?.user?._id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 403 });
  }

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
    !title ||
    !title.length ||
    !description ||
    !description.length ||
    !category ||
    !category.length
  ) {
    return NextResponse.json(
      { message: "Submitted with incorrect data" },
      { status: 400 }
    );
  }

  const repeatTitle = await DocumentModel.findOne({ title: title });
  if (repeatTitle) {
    {
      return NextResponse.json(
        { message: "Document with this title already exists" },
        { status: 400 }
      );
    }
  }

  try {
    await DocumentModel.create({
      userId: session.user._id,
      title,
      description,
      category,
    });
  } catch (e) {
    return NextResponse.json(
      { message: "Failed creating the new document" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Created the new document successfully" },
    { status: 200 }
  );
}
