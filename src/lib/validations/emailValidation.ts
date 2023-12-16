import * as z from "zod";

export const emailValidationSchema = z.object({
  email: z.string().email(),
});
