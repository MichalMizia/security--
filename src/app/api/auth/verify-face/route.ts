import authOptions from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";
import {
  Canvas,
  loadImage,
  Image as CanvasImage,
  ImageData as CanvasImageData,
} from "canvas";

export async function POST(request: NextRequest) {
  // verify the session
  const session = await getServerSession(authOptions);

  if (!session?.user?._id) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 403 });
  }

  // get the file
  const data = await request.formData();
  const file: File | null = data.get("images") as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  await tf.setBackend("cpu");
  await tf.ready();
  const base_url = process.env.NEXT_PUBLIC_BASE_URL as string;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(`${base_url}models`),
    faceapi.nets.faceLandmark68Net.loadFromUri(`${base_url}models`),
    faceapi.nets.faceRecognitionNet.loadFromUri(`${base_url}models`),
  ]);

  // console.log(file);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    faceapi.env.monkeyPatch({
      Canvas: Canvas,
      Image: CanvasImage,
      ImageData: CanvasImageData,
    } as any);

    const uploaded_img = await loadImage(buffer);
    if (!uploaded_img) {
      return NextResponse.json(
        { message: "No uploaded image" },
        { status: 403 }
      );
    }

    const session_img = await loadImage(session.user?.image || "");
    if (!session_img) {
      return NextResponse.json(
        { message: "No image in current session" },
        { status: 403 }
      );
    }

    const CORRECT_FACE = await faceapi
      .detectSingleFace(
        session_img as any,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    const faceMatcher = new faceapi.FaceMatcher(CORRECT_FACE?.descriptor);

    if (!faceMatcher) {
      return NextResponse.json(
        { message: "No face found on the session image" },
        { status: 403 }
      );
    }

    const face_sent = await faceapi
      .detectSingleFace(
        uploaded_img as any,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!face_sent) {
      return NextResponse.json(
        { message: "No face found on the sent image" },
        { status: 403 }
      );
    }

    const score = faceMatcher.matchDescriptor(face_sent?.descriptor);

    //  A distance lower than 0.6 means, that the faces are very likely from the same person.
    if (score.distance < 0.6) {
      return NextResponse.json(
        { message: "Authorized", distance: score.distance },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "Unauthorized face" },
        { status: 403 }
      );
    }
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { message: "There was an error during authorization" },
      { status: 403 }
    );
  }
}
