import { logger } from "../utils/logger.js";
import { cleanupStaleOrders } from "./cleanupStaleOrders.js";
import { purgeCredentials } from "./purgeCredentials.js";
import { remindWaiting } from "./remindWaiting.js";

const guarded = (name: string, job: () => Promise<unknown>) => {
  let running = false;
  return async (): Promise<void> => {
    if (running) return;
    running = true;
    try {
      const result = await job();
      logger.info({ job: name, result }, "Job finished");
    } catch (err) {
      logger.error({ err, job: name }, "Job failed");
    } finally {
      running = false;
    }
  };
};

export const startScheduler = (): void => {
  const staleJob = guarded("cleanupStaleOrders", cleanupStaleOrders);
  const reminderJob = guarded("remindWaiting", remindWaiting);
  const purgeJob = guarded("purgeCredentials", purgeCredentials);

  setTimeout(() => {
    void staleJob();
    void reminderJob();
    void purgeJob();
  }, 60_000).unref();
  setInterval(() => void staleJob(), 60 * 60 * 1000).unref();
  setInterval(() => void purgeJob(), 60 * 60 * 1000).unref();
  setInterval(() => void reminderJob(), 15 * 60 * 1000).unref();

  logger.info("Scheduler started");
};
