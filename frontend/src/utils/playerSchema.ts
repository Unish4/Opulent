import { z } from "zod";
import type { PlayerField } from "../types/game";

export type PlayerFormValues = Record<string, string>;

const buildFieldSchema = (field: PlayerField) => {
  let schema = z
    .string()
    .trim()
    .min(1, `${field.label} is required`)
    .min(
      field.minLength,
      `${field.label} must be at least ${field.minLength} characters`,
    )
    .max(
      field.maxLength,
      `${field.label} must be at most ${field.maxLength} characters`,
    );

  if (field.ruleType === "digits") {
    schema = schema.regex(/^\d+$/, `${field.label} must contain numbers only`);
  }
  if (field.ruleType === "alphanumeric") {
    schema = schema.regex(
      /^[A-Za-z0-9]+$/,
      `${field.label} must contain letters and numbers only`,
    );
  }
  if (field.ruleType === "email") {
    schema = schema.email("Enter a valid email address");
  }

  return field.required ? schema : z.union([z.literal(""), schema]);
};

export const buildPlayerSchema = (fields: PlayerField[]) =>
  z.object(
    Object.fromEntries(
      fields.map((field) => [field.key, buildFieldSchema(field)]),
    ),
  );
