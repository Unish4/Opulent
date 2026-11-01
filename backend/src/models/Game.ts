import { Schema, model, type Document } from "mongoose";

export const PLAYER_FIELD_KEYS = [
  "playerId",
  "serverId",
  "playerName",
  "email",
  "login",
  "password",
] as const;
export type PlayerFieldKey = (typeof PLAYER_FIELD_KEYS)[number];

export const FIELD_RULE_TYPES = [
  "digits",
  "alphanumeric",
  "text",
  "email",
  "password",
] as const;
export type FieldRuleType = (typeof FIELD_RULE_TYPES)[number];

export const FULFILMENT_TYPES = ["uid_topup"] as const;
export type FulfilmentType = (typeof FULFILMENT_TYPES)[number];

export interface IPlayerField {
  key: PlayerFieldKey;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  ruleType: FieldRuleType;
  minLength: number;
  maxLength: number;
}

export interface IGame extends Document {
  name: string;
  slug: string;
  aliases: string[];
  publisher?: string;
  description?: string;
  imageUrl?: string;
  imagePublicId?: string;
  instructions?: string;
  fulfilmentType: FulfilmentType;
  playerFields: IPlayerField[];
  lookup: {
    enabled: boolean;
    providerGameCode?: string;
  };
  isPublished: boolean;
  acceptingOrders: boolean;
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const playerFieldSchema = new Schema<IPlayerField>(
  {
    key: { type: String, enum: PLAYER_FIELD_KEYS, required: true },
    label: { type: String, required: true, trim: true, maxlength: 40 },
    placeholder: { type: String, trim: true, maxlength: 60 },
    helpText: { type: String, trim: true, maxlength: 200 },
    required: { type: Boolean, default: true },
    ruleType: { type: String, enum: FIELD_RULE_TYPES, required: true },
    minLength: { type: Number, required: true, min: 1, max: 100 },
    maxLength: { type: Number, required: true, min: 1, max: 100 },
  },
  { _id: false },
);

const gameSchema = new Schema<IGame>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug may contain lowercase letters, numbers and hyphens",
      ],
      maxlength: 60,
    },
    aliases: {
      type: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
      default: [],
    },
    publisher: { type: String, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 500 },
    imageUrl: { type: String, trim: true },
    imagePublicId: { type: String, trim: true, maxlength: 200 },
    instructions: { type: String, trim: true, maxlength: 1000 },
    fulfilmentType: {
      type: String,
      enum: FULFILMENT_TYPES,
      default: "uid_topup",
    },
    playerFields: { type: [playerFieldSchema], default: [] },
    lookup: {
      enabled: { type: Boolean, default: false },
      providerGameCode: { type: String, trim: true, maxlength: 60 },
    },
    isPublished: { type: Boolean, default: false },
    acceptingOrders: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

gameSchema.index({ isPublished: 1, isFeatured: -1, sortOrder: 1 });

gameSchema.pre("validate", function () {
  const keys = this.playerFields.map((field) => field.key);

  if (new Set(keys).size !== keys.length) {
    this.invalidate("playerFields", "Each player field can only be used once");
  }
  if (
    !keys.includes("playerId") &&
    !keys.includes("email") &&
    !keys.includes("login")
  ) {
    this.invalidate(
      "playerFields",
      "A game needs a playerId, email or login field",
    );
  }
  if (
    keys.includes("password") &&
    !keys.includes("login") &&
    !keys.includes("email")
  ) {
    this.invalidate(
      "playerFields",
      "A password field needs a login or email field",
    );
  }
  for (const field of this.playerFields) {
    if (field.minLength > field.maxLength) {
      this.invalidate(
        "playerFields",
        `${field.key}: minLength cannot exceed maxLength`,
      );
    }
  }
  if (this.lookup?.enabled) {
    if (!this.lookup.providerGameCode) {
      this.invalidate(
        "lookup.providerGameCode",
        "Provider game code is required when lookup is enabled",
      );
    }
    if (!keys.includes("playerId")) {
      this.invalidate("lookup.enabled", "Lookup needs a playerId field");
    }
  }
});

export const Game = model<IGame>("Game", gameSchema);
