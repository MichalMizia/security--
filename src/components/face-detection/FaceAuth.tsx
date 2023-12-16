"use client";

import axios from "axios";
import FaceScanner, { FaceScannerOnSubmitProps } from "./FaceScanner";
import { validateError } from "@/lib/validateError";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

interface FaceAuthorizationProps {
  finalCB?: () => void;
}

const FaceAuthorization = ({ finalCB }: FaceAuthorizationProps) => {
  const { update } = useSession();

  const onSubmit = async ({ file, setIsLoading }: FaceScannerOnSubmitProps) => {
    const formData = new FormData();

    formData.append("images", file);

    try {
      await axios.post("/api/auth/verify-face", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      update({ isFaceAuthorized: true });
      toast.success("Successfully authorized");
    } catch (e) {
      const message = validateError(e, "Could not authorize via face");
      toast.error(message);
    } finally {
      setIsLoading(false);
      if (finalCB) {
        finalCB();
      }
    }
  };

  return <FaceScanner onSubmit={onSubmit} />;
};

export default FaceAuthorization;
