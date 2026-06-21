import { ValidationError } from "@vero/shared-errors";
import { z } from "zod";

export const mobileNumberSchema = z.string().regex(/^\+[1-9]\d{7,14}$/, "Mobile number must be E.164 format");
export const uuidSchema = z.string().uuid();

export const parseOrThrow = <T>(schema: z.Schema<T>, input: unknown): T => {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError("Request validation failed", {
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message
      }))
    });
  }

  return parsed.data;
};

export { z };
