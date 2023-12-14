import { AxiosError } from "axios";
import { ZodError } from "zod";

export const validateError = (
  e: unknown,
  defaultMessage = "Something went wrong"
) => {
  if (
    e instanceof AxiosError &&
    e.response?.status?.toString()[0] === "4" &&
    e.response?.data?.message
  ) {
    return e.response.data.message;
  } else if (e instanceof ZodError) {
    return `Form filled out incorrectly, ${e.message}`;
  } else {
    return defaultMessage;
  }
};
