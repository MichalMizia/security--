import * as z from "zod";

export const documentValidationSchema = z.object({
    title: z.string(),
    description: z.string(),
    category: z.string()
});
