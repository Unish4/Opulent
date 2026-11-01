import { z } from "zod";
import type { IPlayerField, PlayerFieldKey } from "../models/Game.js";

const buildFieldSchema = (field: IPlayerField) => {
  let schema = (field.key === "password" ? z.string() : z.string().trim())
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

export const buildPlayerDetailsSchema = (
  fields: IPlayerField[],
  only?: PlayerFieldKey[],
) =>
  z
    .object(
      Object.fromEntries(
        fields
          .filter((field) => !only || only.includes(field.key))
          .map((field) => [field.key, buildFieldSchema(field)]),
      ),
    )
    .strict();
