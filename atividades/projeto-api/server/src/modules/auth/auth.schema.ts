import z from "zod";

export const userLoginSchema = z.object({
  body: z.object({
    email: z.string().transform((e) => {
      return e.trim().toLowerCase();
    }),
    password: z.string(),
  }),
});

export type UserLogin = z.infer<typeof userLoginSchema>["body"];