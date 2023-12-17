import authOptions from "@/lib/auth";
import initMongoose from "@/lib/db/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 403 });
  }

  const { bucket } = await initMongoose();

  const data = await req.formData();

  const entry = Array.from(data.entries())[0];
  const [key, value] = entry;

  // FormDataEntryValue can either be type `Blob` or `string`
  // if its type is object then it's a Blob
  const isFile = typeof value == "object";

  if (isFile) {
    const blob = value as File;
    const filename = blob.name;

    //conver the blob to stream
    const buffer = Buffer.from(await blob.arrayBuffer());
    const stream = Readable.from(buffer);

    const uploadStream = bucket.openUploadStream(filename, {
      // make sure to add content type so that it will be easier to set later.
      contentType: blob.type,
      metadata: {}, //add your metadata here if any
    });

    // pipe the readable stream to a writeable stream to save it to the database
    await stream.pipe(uploadStream);
  }

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { bucket } = await initMongoose();

  const filename = req.nextUrl.searchParams.get("filename") as string;

  if (!filename) {
    return new NextResponse(null, { status: 400, statusText: "Bad Request" });
  }

  const files = await bucket.find({ filename }).toArray();
  if (!files.length) {
    return new NextResponse(null, { status: 404, statusText: "Not found" });
  }

  const file = files.at(0)!;

  // Force the type to be ReadableStream since NextResponse doesn't accept GridFSBucketReadStream
  const stream = bucket.openDownloadStreamByName(
    filename
  ) as unknown as ReadableStream;

  // Return a streamed response
  return new NextResponse(stream, {
    headers: {
      "Content-Type": file.contentType!,
    },
  });
}
