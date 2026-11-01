import { z } from "zod";

const fieldKeys = [
  "playerId",
  "serverId",
  "playerName",
  "email",
  "login",
  "password",
] as const;

const ruleTypes = [
  "digits",
  "alphanumeric",
  "text",
  "email",
  "password",
] as const;

export const gameFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(60),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, "Slug is required")
      .max(60)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Lowercase letters, numbers and hyphens only",
      ),
    aliases: z.string().trim(),
    publisher: z.string().trim().max(60),
    description: z.string().trim().max(500),
    instructions: z.string().trim().max(1000),
    playerFields: z
      .array(
        z.object({
          key: z.enum(fieldKeys),
          label: z.string().trim().min(1, "Label is required").max(40),
          placeholder: z.string().trim().max(60),
          helpText: z.string().trim().max(200),
          required: z.boolean(),
          ruleType: z.enum(ruleTypes),
          minLength: z.number("Enter a number").int().min(1).max(100),
          maxLength: z.number("Enter a number").int().min(1).max(100),
        }),
      )
      .min(1, "Add at least one field")
      .max(5),
    lookupEnabled: z.boolean(),
    providerGameCode: z.string().trim().max(60),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
    sortOrder: z.number("Enter a number").int().min(0).max(1000),
  })
  .superRefine((value, ctx) => {
    if (value.lookupEnabled && !value.providerGameCode) {
      ctx.addIssue({
        code: "custom",
        path: ["providerGameCode"],
        message: "Provider game code is required when lookup is on",
      });
    }
    const keys = value.playerFields.map((field) => field.key);
    if (new Set(keys).size !== keys.length) {
      ctx.addIssue({
        code: "custom",
        path: ["playerFields"],
        message: "Each field type can be used once",
      });
    }
    if (
      !keys.includes("playerId") &&
      !keys.includes("email") &&
      !keys.includes("login")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["playerFields"],
        message: "Add a player ID, email or login field",
      });
    }
    if (
      keys.includes("password") &&
      !keys.includes("login") &&
      !keys.includes("email")
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["playerFields"],
        message: "A password field needs a login or email field",
      });
    }
    value.playerFields.forEach((field, index) => {
      if (field.minLength > field.maxLength) {
        ctx.addIssue({
          code: "custom",
          path: ["playerFields", index, "minLength"],
          message: "Min cannot exceed max",
        });
      }
    });
  });

export type GameFormValues = z.infer<typeof gameFormSchema>;
