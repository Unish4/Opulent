import { z } from "zod";
import { ENV } from "../config/env.js";

export const listGamesQuerySchema = z.object({
  search: z.string().trim().max(60).optional(),
  featured: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListGamesQuery = z.infer<typeof listGamesQuerySchema>;

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const slugParamSchema = z.object({
  slug: z.string().max(60).regex(slugRegex, "Invalid game slug"),
});

const playerFieldInputSchema = z
  .object({
    key: z.enum(["playerId", "serverId", "playerName", "email"]),
    label: z.string().trim().min(1).max(40),
    placeholder: z.string().trim().max(60).optional(),
    helpText: z.string().trim().max(200).optional(),
    required: z.boolean(),
    ruleType: z.enum(["digits", "alphanumeric", "text", "email"]),
    minLength: z.number().int().min(1).max(100),
    maxLength: z.number().int().min(1).max(100),
  })
  .strict()
  .refine((field) => field.minLength <= field.maxLength, {
    message: "minLength cannot exceed maxLength",
    path: ["minLength"],
  });

const artworkUrlSchema = z
  .string()
  .url()
  .refine(
    (value) =>
      value.startsWith(
        `https://res.cloudinary.com/${ENV.CLOUDINARY.CLOUD_NAME}/`,
      ),
    {
      message: "Image must be uploaded through the admin uploader",
    },
  );

const gameShape = {
  name: z.string().trim().min(2).max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(60)
    .regex(slugRegex, "Invalid slug"),
  aliases: z.array(z.string().trim().toLowerCase().min(1).max(40)).max(15),
  publisher: z.string().trim().max(60).optional(),
  description: z.string().trim().max(500).optional(),
  instructions: z.string().trim().max(1000).optional(),
  playerFields: z.array(playerFieldInputSchema).min(1).max(4),
  lookup: z
    .object({
      enabled: z.boolean(),
      providerGameCode: z.string().trim().max(60).optional(),
    })
    .strict(),
  imageUrl: artworkUrlSchema.optional(),
  imagePublicId: z.string().trim().max(200).optional(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  sortOrder: z.number().int().min(0).max(1000),
};

export const createGameSchema = z.object(gameShape).strict();
export const updateGameSchema = z
  .object(gameShape)
  .omit({ slug: true })
  .partial()
  .strict();
export const availabilitySchema = z
  .object({ acceptingOrders: z.boolean() })
  .strict();

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type UpdateGameInput = z.infer<typeof updateGameSchema>;
