import axios, { AxiosError } from "axios";
import { ZodError } from "zod";

interface RetType {
  message: string;
  status: "error" | "success";
}

export const axiosUpload = async (
  formData: FormData,
  finalCallback: () => void,
  defaultError: string = "Something went wrong"
): Promise<RetType> => {
  let data: RetType = { message: "", status: "success" };

  try {
    await axios.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    data = { message: "", status: "success" };
  } catch (e) {
    if (
      e instanceof AxiosError &&
      e.response?.status?.toString()[0] === "4" &&
      e.response?.data?.message
    ) {
      data = { message: e.response.data.message, status: "error" };
    } else if (e instanceof ZodError) {
      data = { message: e.message, status: "error" };
    } else {
      data = { message: defaultError, status: "error" };
    }
  } finally {
    finalCallback();
  }

  return data;
};
