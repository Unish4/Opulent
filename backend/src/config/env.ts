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
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

if ((process.env.LOOKUP_TOKEN_SECRET as string).length < 32) {
  throw new Error("LOOKUP_TOKEN_SECRET must be at least 32 characters");
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
    API_KEY: process.env.VOLSEVER_API_KEY || undefined,
  },
  LOOKUP: {
    TOKEN_SECRET: process.env.LOOKUP_TOKEN_SECRET as string,
    TOKEN_TTL_SECONDS: positiveInt("LOOKUP_TOKEN_TTL_SECONDS", 1800),
    TIMEOUT_MS: positiveInt("LOOKUP_TIMEOUT_MS", 4000),
    USER_LIMIT_PER_HOUR: positiveInt("LOOKUP_USER_LIMIT_PER_HOUR", 10),
    DAILY_LIMIT: positiveInt("LOOKUP_DAILY_LIMIT", 10),
    CACHE_TTL_SECONDS: positiveInt("LOOKUP_CACHE_TTL_SECONDS", 600),
  },
  OWNER_EMAILS: csv(process.env.OWNER_EMAILS),
  REQUIRE_ADMIN_MFA: process.env.REQUIRE_ADMIN_MFA === "true",
};

export const isDevelopment = ENV.NODE_ENV === "development";
