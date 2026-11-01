import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { ENV } from "../config/env.js";

const key = Buffer.from(ENV.CREDENTIAL_KEY, "hex");

export const encryptSecret = (plain: string, context: string): string => {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(context, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

export const decryptSecret = (payload: string, context: string): string => {
  const [version, iv, tag, data] = payload.split(":");
  if (version !== "v1" || !iv || !tag || !data)
    throw new Error("Unsupported secret format");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64"),
  );
  decipher.setAAD(Buffer.from(context, "utf8"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64")),
    decipher.final(),
  ]).toString("utf8");
};
