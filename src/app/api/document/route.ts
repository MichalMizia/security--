import { HydratedDocument } from "mongoose";
import authOptions from "@/lib/auth";
import initMongoose from "@/lib/db/db";
import { DocumentModel, IDocument } from "@/model/document";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";

interface PostReqType {
  title: string;
  description: string;
  category: string;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { title, description, category }: PostReqType = await req.json();

  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;
  if (!userId) {
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

  const repeatTitle = await DocumentModel.findOne({ title: title })
    .lean()
    .exec();
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

interface PatchReqType {
  title: string;
  description: string;
  category: string;
  id: string;
}

export async function PATCH(req: NextRequest, res: NextResponse) {
  const { title, description, category, id }: PatchReqType = await req.json();

  const session = await getServerSession(authOptions);
  const userId = session?.user?._id;

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

  if (
    !title ||
    !title.length ||
    !description ||
    !description.length ||
    !category ||
    !category.length ||
    !id ||
    !id.length
  ) {
    return NextResponse.json(
      { message: "Submitted with incorrect data" },
      { status: 400 }
    );
  }

  const repeatTitle: IDocument = (await DocumentModel.findOne({
    title: title,
  })
    .lean()
    .exec()) as IDocument;
  if ((repeatTitle._id as any) != id) {
    {
      return NextResponse.json(
        { message: "Document with this title already exists" },
        { status: 400 }
      );
    }
  }

  try {
    const document: HydratedDocument<IDocument> | null =
      await DocumentModel.findById(id);
    if (document?.userId.toString() !== userId) {
      return NextResponse.json(
        { message: "Not authorized to edit this document" },
        { status: 403 }
      );
    }

    // update the document
    document?.set({
      title,
      description,
      category,
    });
    await document?.save();
  } catch (e) {
    return NextResponse.json(
      { message: "Failed updating the document" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { message: "Updated the document successfully" },
    { status: 200 }
  );
}
