"use client";

import { useEffect, useRef } from "react";

import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";
import FACE_MICHAL from "@/../public/face_michal.jpg";
import axios from "axios";

interface FaceDetectionProps {}

const FaceDetection = async ({}: FaceDetectionProps) => {
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    tf.setBackend("cpu").then(() => tf.ready().then(() => loadModels()));

    videoRef.current?.addEventListener("play", () => {
      handlePlay();
    });

    return () => {
      videoRef.current?.removeEventListener("play", () => {
        handlePlay();
      });

      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  const handlePlay = () => {
    // init the canvas
    if (videoRef.current != null && canvasRef.current != null) {
      const canvas = canvasRef.current;
      const displaySize = {
        width: videoRef.current.width,
        height: videoRef.current.height,
      };
      faceapi.matchDimensions(canvas, displaySize);

      const faceMatcher = getFaceMatcher(FACE_MICHAL.src);

      detectFaces(videoRef.current, canvas, displaySize, faceMatcher);
    }
  };

  const getFaceMatcher = async (correctSource: string) => {
    const FACE_IMG = document.createElement("img");
    FACE_IMG.src = correctSource;

    const CORRECT_FACE = await faceapi
      .detectSingleFace(FACE_IMG, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    return new faceapi.FaceMatcher(CORRECT_FACE?.descriptor);
  };

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(startVideo);
  };

  const startVideo = () => {
    if (videoRef.current != null) {
      navigator.mediaDevices
        .getUserMedia({ video: {}, audio: false })
        // @ts-expect-error
        .then((stream: any) => (videoRef.current.srcObject = stream))
        .catch((err) => console.error(err));
    }
  };

  const detectFaces = (
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    displaySize: {
      width: number;
      height: number;
    },
    faceMatcherPromise: Promise<faceapi.FaceMatcher>
  ) => {
    // create the interval to detect faces
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }

    intervalId.current = setInterval(async () => {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();
      const resizedDetection = faceapi.resizeResults(detection, displaySize);

      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

      faceapi.draw.drawDetections(canvas, resizedDetection || []);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetection || []);
      // faceapi.draw.drawFaceExpressions(canvas, resizedDetection || []);

      if (detection) {
        const bestMatch = (await faceMatcherPromise).matchDescriptor(
          detection.descriptor
        );

        if (bestMatch.distance < 0.4) {
          await handleCorrectDetection(detection);
        }
      }
    }, 400);
  };

  const handleCorrectDetection = async (
    detection:
      | faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<
            {
              detection: faceapi.FaceDetection;
            },
            faceapi.FaceLandmarks68
          >
        >
      | undefined
  ) => {
    if (videoRef.current) {
      stopStreamedVideo(videoRef.current);
    }

    if (intervalId.current) {
      clearInterval(intervalId.current);
    }
    intervalId.current = null;

    await axios.post("/api/authorize-face", {
      detection: detection,
    });
  };

  const stopStreamedVideo = (video: HTMLVideoElement) => {
    video.pause();
    // @ts-expect-error
    const tracks: any[] = video.srcObject?.getTracks() || [];

    tracks.forEach((track) => {
      track.stop();
    });
  };

  return (
    <div className="relative isolate w-fit">
      <video
        ref={videoRef}
        id="video"
        width="720"
        height="560"
        autoPlay
        muted
      ></video>
      {/* <img src="/public/face_michal.jpg" alt="Sample" /> */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
};

export default FaceDetection;
