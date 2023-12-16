"use client";

import { requestHandler } from "@/lib/requestHandler";
import axios, { AxiosResponse } from "axios";
import { PasswordInput } from "./ui/password-input";
import { DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import FaceUpload from "./face-detection/FaceUpload";
import FaceAuthorization from "./face-detection/FaceAuth";
import { Suspense, useReducer } from "react";

interface AccessDocumentDialogContentProps {}

interface Response {
  pin: string;
}

export const getPin = requestHandler<undefined, Response>((params) =>
  axios.get("/api/auth/get-pin", { params })
);

const AccessDocumentDialogContent =
  async ({}: AccessDocumentDialogContentProps) => {
    // reducer to force update to this component
    const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
    const data = await getPin();

    if (data.code == "error") {
      if ((data.error.response as AxiosResponse).data.faceError) {
        return (
          <>
            <p className="text-red-500 text-[15px] mt-2">
              {(data.error.response as AxiosResponse).data.message}
            </p>
            <Suspense fallback={<div>...Loading face auth</div>}>
              <FaceAuthorization finalCB={() => forceUpdate()} />
            </Suspense>
          </>
        );
      } else {
        return (
          <>
            <h3 className="text-2xl mb-2 text-center font-semibold">
              Unauthorized
            </h3>
            <p className="text-red-500 text-center text-[15px]">
              {(data.error.response as AxiosResponse).data.message}
            </p>
          </>
        );
      }
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle>Successfully authorized</DialogTitle>
          <DialogDescription>
            Pin will be sent to esp32 controller
          </DialogDescription>
        </DialogHeader>
        <main className="py-4">
          <PasswordInput value={data.data.pin} />
        </main>
      </>
    );
  };

export default AccessDocumentDialogContent;
