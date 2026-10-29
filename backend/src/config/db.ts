import mongoose from "mongoose";
import { ENV } from "./env.js";
import { logger } from "../utils/logger.js";

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);
    mongoose.connection.on("disconnected", () =>
      logger.warn("MongoDB disconnected"),
    );
    mongoose.connection.on("reconnected", () =>
      logger.info("MongoDB reconnected"),
    );

    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      logger.fatal(`MongoDB connection error: ${error.message}`);
    } else {
      logger.fatal({ err: error }, "MongoDB connection error");
    }
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};

export const pingDB = async (timeoutMs = 2000): Promise<boolean> => {
  const db = mongoose.connection.db;
  if (mongoose.connection.readyState !== 1 || !db) return false;

  let timer: NodeJS.Timeout | undefined;
  try {
    await Promise.race([
      db.admin().ping(),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("ping timeout")), timeoutMs);
      }),
    ]);
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};
