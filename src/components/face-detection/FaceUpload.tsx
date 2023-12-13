"use client";

import { RefObject, useEffect, useRef, useState } from "react";

import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";
import { CameraIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getRandomPin } from "@/lib/utils";
import { stopStreamedVideo } from "@/lib/video";
import { axiosUpload } from "@/lib/axiosUpload";
import { useSession } from "next-auth/react";
import { BASE_ASSET_URL } from "@/pages/api/upload";
import axios, { AxiosError } from "axios";
// import initMongoose from "@/lib/db/db";
// import User from "@/model/user";

interface FaceUploadProps {}

const FaceUpload = ({}: FaceUploadProps) => {
  const { data: session, update } = useSession();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    tf.setBackend("cpu")
      .then(() => tf.ready().then(() => loadModels()))
      .then(() => startVideo());

    videoRef.current?.addEventListener("play", () => {
      handlePlay();
    });

    // cleanup
    return () => {
      videoRef.current?.removeEventListener("play", () => {
        handlePlay();
      });

      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
    };
  }, []);

  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]);
  };

  const startVideo = () => {
    if (videoRef.current != null) {
      navigator.mediaDevices
        .getUserMedia({ video: {}, audio: false })
        .then(
          (stream: any) =>
            ((videoRef.current as HTMLVideoElement).srcObject = stream)
        )
        .catch((err) => console.error(err));
    }
  };

  const handlePlay = () => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }
    // init the canvas
    const canvas = canvasRef.current;
    const video = videoRef.current;

    const displaySize = {
      width: video.width,
      height: video.height,
    };
    // match the video dimensions to canvas
    faceapi.matchDimensions(canvas, displaySize);

    // clear the interval if it is present
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }

    // every 400ms, detect faces and draw the detections onto the canvas
    intervalId.current = setInterval(async () => {
      const detection = await detectFaces(
        videoRef.current as HTMLVideoElement,
        displaySize
      );

      drawDetections(canvas, detection || []);
    }, 400);
  };

  const detectFaces = async (
    video: HTMLVideoElement,
    displaySize: {
      width: number;
      height: number;
    }
  ) => {
    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();
    const resizedDetection = faceapi.resizeResults(detection, displaySize);

    return resizedDetection;
  };

  const drawDetections = (
    canvas: HTMLCanvasElement,
    detections:
      | faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<
            {
              detection: faceapi.FaceDetection;
            },
            faceapi.FaceLandmarks68
          >
        >
      | never[]
  ) => {
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);

    faceapi.draw.drawDetections(canvas, detections);
    faceapi.draw.drawFaceLandmarks(canvas, detections);
  };

  const handleSubmit = async (
    videoRef: RefObject<HTMLVideoElement>,
    canvasRef: RefObject<HTMLCanvasElement>
  ) => {
    // wait for one last drawing onto the canvas
    if (intervalId.current) {
      clearInterval(intervalId.current);
    }

    setIsLoading(true);

    if (!videoRef.current) {
      setIsLoading(false);
      return toast.error("Something went wrong when adding the photo");
    }

    const video = videoRef.current;
    // stop streaming from user and pause video
    stopStreamedVideo(video);

    if (!canvasRef.current) {
      setIsLoading(false);
      return toast.error("Something went wrong when adding the photo");
    }

    const canvas = canvasRef.current;
    const detection = await detectFaces(video, {
      width: video.width,
      height: video.height,
    });

    // clear and repaint the canvas using video data
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    canvas
      .getContext("2d")
      ?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsLoading(false);
        return toast.error("Something went wrong when adding the photo");
      }

      const formData = new FormData();
      const filename = `${getRandomPin(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        6
      )}.png`;

      const file = new File([blob], filename, { type: blob.type });
      formData.append("images", file);

      const data = await axiosUpload(
        formData,
        () => setIsLoading(false), // final callback
        "Could not upload photo"
      );

      if (data.status == "success") {
        toast.success("Photo added");

        const filepath = `${process.env.NEXT_PUBLIC_BASE_URL}uploads/${filename}`;
        console.log(filepath);
        // add photo url to mongo db
        axios
          .patch("/api/user", {
            image: filepath,
          })
          .then(() => console.log("Huge success"))
          .catch((e: AxiosError) =>
            toast.error("Could not add image to profile, try again")
          );

        // add photo to session
        await update({
          image: filepath,
        });
      } else {
        toast.error(data.message);
      }
    });
    drawDetections(canvas, detection || []);
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

      <button
        onClick={() => handleSubmit(videoRef, canvasRef)}
        className="absolute cursor-pointer hover:scale-95 transition-all duration-300 hover:bg-slate-900 border-2 border-light-blue/40 bottom-6 bg-slate-950 w-14 h-14 p-4 rounded-full z-20 left-1/2 -translate-x-1/2"
      >
        {isLoading ? (
          <Loader2 className="text-white animate-spin w-5 h-5 absolute inset-0 m-auto" />
        ) : (
          <CameraIcon
            className="text-white w-6 h-6 absolute inset-0 m-auto"
            strokeWidth={2.75}
          />
        )}
      </button>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
};

export default FaceUpload;
