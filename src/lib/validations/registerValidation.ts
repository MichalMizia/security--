import * as z from "zod";

export const userRegisterSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});
