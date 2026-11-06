import z from "zod";

export enum Role {
  CUSTOMER = "CUSTOMER",
  DELIVERER = "DELIVERER",
  MERCHANT = "MERCHANT",
  ADMIN = "ADMIN",
}

export enum filter {
  NAME = "NAME",
  EMAIL = "EMAIL",
}

export const userUuidSchema = z.object({
  params: z.object({
    uuid: z.string().uuid({ message: "Invalid ID. Must be a UUID." }),
  }),
});

const greatPass = z.string().superRefine((val, ctx) => {
  // 1. Verifica o tamanho mínimo
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A senha deve ter no mínimo 8 caracteres",
    });
    return z.NEVER; // O return z.NEVER para a execução aqui!
  }

  // 2. Verifica a letra maiúscula
  if (!/[A-Z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A senha deve conter pelo menos uma letra maiúscula",
    });
    return z.NEVER;
  }

  // 3. Verifica a letra minúscula
  if (!/[a-z]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A senha deve conter pelo menos uma letra minúscula",
    });
    return z.NEVER;
  }

  // 4. Verifica o número
  if (!/[0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A senha deve conter pelo menos um número",
    });
    return z.NEVER;
  }

  // 5. Verifica o caractere especial
  if (!/[^a-zA-Z0-9]/.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "A senha deve conter pelo menos um caractere especial (ex: @, #, $, etc.)",
    });
    return z.NEVER;
  }
});

const userBodySchema = z
  .object({
    name: z.string().min(4, { message: "Invalid name." }),
    password: greatPass,
    confirmPassword: greatPass,
    email: z
      .string()
      .email({ message: "Invalid email." })
      .transform((e) => {
        return e.trim().toLowerCase();
      }),
    phone: z.string().nullable().optional(),
    role: z
      .nativeEnum(Role, { message: "Invalid role" })
      .default(Role.CUSTOMER),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["password"],
  });

export const userSchema = z.object({
  body: userBodySchema,
});

export const searchUserSchema = z.object({
  query: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
  }),
});

export const bulkUserSchema = z.object({
  body: z.array(userBodySchema),
});

export const updateUserSchema = userUuidSchema.merge(
  z.object({
    body: z.object({
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      isActive: z.boolean().optional(),
      role: z.nativeEnum(Role).optional(),
    }),
  }),
);

export type UpdateUserDataBody = z.infer<typeof updateUserSchema>["body"];
export type UpdateUserDataParams = z.infer<typeof updateUserSchema>["params"];
export type SearchUserData = z.infer<typeof searchUserSchema>["query"];
export type CreateUserData = z.infer<typeof userSchema>["body"];
export type CreateBulkUserData = z.infer<typeof bulkUserSchema>["body"];
