import dotenv from "dotenv";
dotenv.config();

const requiredEnvVars: string[] = [
  "MONGODB_URI",
  "NODE_ENV",
  "CLIENT_URL",
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

const csv = (value: string | undefined): string[] =>
  (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

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
  OWNER_EMAILS: csv(process.env.OWNER_EMAILS),
  REQUIRE_ADMIN_MFA: process.env.REQUIRE_ADMIN_MFA === "true",
};

export const isDevelopment = ENV.NODE_ENV === "development";
