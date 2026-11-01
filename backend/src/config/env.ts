import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars: string[] = [
  "MONGODB_URI",
  "NODE_ENV",
  "CLIENT_URL",
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "LOOKUP_TOKEN_SECRET",
  "CREDENTIAL_ENCRYPTION_KEY",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

if ((process.env.LOOKUP_TOKEN_SECRET as string).length < 32) {
  throw new Error("LOOKUP_TOKEN_SECRET must be at least 32 characters");
}

if (
  !/^[0-9a-fA-F]{64}$/.test(process.env.CREDENTIAL_ENCRYPTION_KEY as string)
) {
  throw new Error("CREDENTIAL_ENCRYPTION_KEY must be 64 hex characters");
}

const csv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

const positiveInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive whole number`);
  }
  return value;
};

const nonNegativeInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative whole number`);
  }
  return value;
};

const volseverKeys: Record<string, string> = {};
for (const [name, value] of Object.entries(process.env)) {
  if (name.startsWith("VOLSEVER_KEY_") && value) {
    volseverKeys[
      name.slice("VOLSEVER_KEY_".length).toLowerCase().replace(/_/g, "-")
    ] = value;
  }
}

export const ENV = {
  PORT: process.env.PORT || "3000",
  MONGODB_URI: process.env.MONGODB_URI as string,
  NODE_ENV: process.env.NODE_ENV as string,
  CLIENT_URL: process.env.CLIENT_URL as string,
  LOG_LEVEL: process.env.LOG_LEVEL || "info",
  CLERK: {
    SECRET_KEY: process.env.CLERK_SECRET_KEY as string,
    PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY as string,
    WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET || undefined,
  },
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    API_KEY: process.env.CLOUDINARY_API_KEY as string,
    API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  },
  VOLSEVER: {
    BASE_URL: process.env.VOLSEVER_BASE_URL || "https://gate.volsever.com",
    DEFAULT_KEY: process.env.VOLSEVER_API_KEY || undefined,
    KEYS: volseverKeys,
  },
  LOOKUP: {
    TOKEN_SECRET: process.env.LOOKUP_TOKEN_SECRET as string,
    TOKEN_TTL_SECONDS: positiveInt("LOOKUP_TOKEN_TTL_SECONDS", 1800),
    TIMEOUT_MS: positiveInt("LOOKUP_TIMEOUT_MS", 4000),
    USER_LIMIT_PER_HOUR: positiveInt("LOOKUP_USER_LIMIT_PER_HOUR", 3),
    MONTHLY_LIMIT: positiveInt("LOOKUP_MONTHLY_LIMIT", 40),
    PER_MINUTE_LIMIT: positiveInt("LOOKUP_PER_MINUTE_LIMIT", 12),
    CACHE_TTL_SECONDS: positiveInt("LOOKUP_CACHE_TTL_SECONDS", 604800),
  },
  ARCJET: {
    KEY: process.env.ARCJET_KEY || undefined,
    MODE: (process.env.ARCJET_MODE === "LIVE" ? "LIVE" : "DRY_RUN") as
      | "LIVE"
      | "DRY_RUN",
  },
  RUN_SCHEDULER: process.env.RUN_SCHEDULER === "true",
  OWNER_EMAILS: csv(process.env.OWNER_EMAILS),
  PILOT_EMAILS: csv(process.env.PILOT_EMAILS),
  DAILY_ORDER_CAP: nonNegativeInt("DAILY_ORDER_CAP", 0),
  REQUIRE_ADMIN_MFA: process.env.REQUIRE_ADMIN_MFA === "true",
  STALE_ORDER_HOURS: positiveInt("STALE_ORDER_HOURS", 48),
  REMINDER_AFTER_MINUTES: positiveInt("REMINDER_AFTER_MINUTES", 15),
  REMINDER_REPEAT_MINUTES: positiveInt("REMINDER_REPEAT_MINUTES", 60),
  TELEGRAM: {
    BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || undefined,
    CHAT_ID: process.env.TELEGRAM_CHAT_ID || undefined,
  },
  CREDENTIAL_KEY: process.env.CREDENTIAL_ENCRYPTION_KEY as string,
};

export const isDevelopment = ENV.NODE_ENV === "development";
