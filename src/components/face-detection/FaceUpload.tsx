"use client";

import FaceScanner, { FaceScannerOnSubmitProps } from "./FaceScanner";
import { axiosUpload } from "@/lib/axiosUpload";
import toast from "react-hot-toast";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";

interface FaceUploadProps {}

const FaceUpload = ({}: FaceUploadProps) => {
  const { update } = useSession();

  const onSubmit = async ({ file, setIsLoading }: FaceScannerOnSubmitProps) => {
    const formData = new FormData();

    formData.append("images", file);

    const data = await axiosUpload(
      formData,
      () => setIsLoading(false), // final callback
      "Could not upload photo"
    );

    if (data.status == "success") {
      toast.loading("Photo submitted adding to profile");

      const filepath = `${process.env.NEXT_PUBLIC_BASE_URL}uploads/${file.name}`;

      // add photo url to mongo db
      axios
        .patch("/api/user", {
          image: filepath,
        })
        .then(() => {
          toast.dismiss();
          toast.success("Photo added");
        })
        .catch((e: AxiosError) =>
          toast.error("Could not add image to profile, try again")
        );

      // add photo to session
      await update({
        image: filepath,
        resetFaceAuthorization: true,
      });
    } else {
      toast.error(data.message);
    }
  };

  return (
    <div>
      <FaceScanner onSubmit={onSubmit} />
    </div>
  );
};

export default FaceUpload;