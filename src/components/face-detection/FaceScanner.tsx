"use client";

import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

import * as tf from "@tensorflow/tfjs";
import * as faceapi from "@vladmandic/face-api/dist/face-api.esm-nobundle.js";
import { CameraIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { getRandomPin } from "@/lib/utils";
import { stopStreamedVideo } from "@/lib/video";

export interface FaceScannerOnSubmitProps {
  file: File;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

interface FaceScannerProps {
  onSubmit: (props: FaceScannerOnSubmitProps) => void;
}

/**
 * This is the base component for FaceUpload and FaceDetection
 * It prompts the user for camera access, then streams the user video
 * to a canvas and paints a face using face_api onto it every 400ms.
 * It has a submit button which submits the current state of the camera as a .png file
 * @constructor
 * @param {(File, setIsLoading)} onSubmit - The callback to be executed with the file, it also takes setIsLoading as argument.
 */
const FaceScanner = ({ onSubmit }: FaceScannerProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);

  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    tf.setBackend("cpu")
      .then(() => tf.ready().then(() => loadModels()))
      .then(() => startVideo())
      .finally(() => {
        setIsVideoLoading(false);
      });

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
          (stream: MediaStream) =>
            ((videoRef.current as HTMLVideoElement).srcObject = new MediaStream(
              stream.getVideoTracks()
            ))
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
    // redraw detection at the end of this function
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

      const filename = `${getRandomPin(
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
        6
      )}.png`;
      const file = new File([blob], filename, { type: blob.type });

      onSubmit({ file, setIsLoading });
    });
    drawDetections(canvas, detection || []);
  };

  return (
    <div className="relative w-fit isolate p-2 bg-white shadow-md rounded-sm">
      <video
        ref={videoRef}
        id="video"
        width="720"
        height="560"
        className="rounded-sm"
        autoPlay
        muted
      ></video>

      {isVideoLoading && (
        <div className="absolute z-50 bg-slate-500/50 animate-pulse inset-0 w-full h-full"></div>
      )}

      <div className="line bottom-[52px] left-0 right-0 w-full h-1 bg-white/50 absolute"></div>

      <button
        onClick={() => handleSubmit(videoRef, canvasRef)}
        className="absolute cursor-pointer hover:scale-95 transition-all duration-300 hover:bg-slate-800 group border-2 border-white/30 shadow-md bottom-6 bg-slate-950 w-16 h-16 p-7 rounded-full z-20 left-1/2 -translate-x-1/2"
      >
        {isLoading ? (
          <Loader2 className="text-white animate-spin w-5 h-5 absolute inset-0 m-auto" />
        ) : (
          <CameraIcon
            className="text-white w-8 h-8 absolute group-hover:text-light-blue inset-0 m-auto"
            strokeWidth={2.25}
          />
        )}
      </button>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
    </div>
  );
};

export default FaceScanner;
