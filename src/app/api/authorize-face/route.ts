import authOptions from "@/lib/auth";
import initMongoose from "@/lib/db/db";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import { getRandomPin } from "@/lib/utils";

import * as canvas from "canvas";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";
import FACE_MICHAL from "@/../public/face_michal.jpg";

interface ReqType {
  detection:
    | faceapi.WithFaceDescriptor<
        faceapi.WithFaceLandmarks<
          {
            detection: faceapi.FaceDetection;
          },
          faceapi.FaceLandmarks68
        >
      >
    | undefined;
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { detection }: ReqType = await req.json();

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

  await tf.setBackend("cpu");
  await tf.ready();
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("http://localhost:3000/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("http://localhost:3000/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("http://localhost:3000/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("http://localhost:3000/models"),
  ]);
  // random 4 digit num
  const randomPin = getRandomPin("0123456789", 4);

  try {
    faceapi.env.monkeyPatch({
      Canvas: canvas.Canvas,
      Image: canvas.Image,
      ImageData: canvas.ImageData,
    } as any);
    // const FACE_IMG = await faceapi.toNetInput(FACE_MICHAL.src);
    const FACE_IMG = await canvas.loadImage(
      "http://localhost:3000/face_michal.jpg"
    );

    const CORRECT_FACE = await faceapi
      // @ts-expect-error
      .detectSingleFace(FACE_IMG, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    const faceMatcher = new faceapi.FaceMatcher(CORRECT_FACE?.descriptor);

    if (!detection?.descriptor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    // console.log(
    //   faceMatcher,
    //   Object.values(detection.descriptor),
    //   CORRECT_FACE?.descriptor
    // );
    // console.log(
    //   Object.values(detection.descriptor).length,
    //   CORRECT_FACE?.descriptor.length
    // );

    const bestMatch = faceMatcher.matchDescriptor(
      // @ts-expect-error
      Object.values(detection.descriptor)
    );

    if (bestMatch.distance >= 0.4) {
      return NextResponse.json(
        { message: "Unauthorized distance" },
        { status: 403 }
      );
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Unauthorized, sum error" },
      { status: 403 }
    );
  }

  return NextResponse.json({ message: "GG", pin: randomPin }, { status: 200 });
}
