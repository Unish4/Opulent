import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import { ENV } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { httpLogger } from "./middleware/httpLogger.js";
import { arcjetProtect } from "./middleware/arcjetProtect.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { startScheduler } from "./jobs/scheduler.js";
import healthRouter from "./routes/health.routes.js";
import webhookRouter from "./routes/webhook.routes.js";
import userRouter from "./routes/user.routes.js";
import adminTeamRouter from "./routes/adminTeam.routes.js";
import gameRouter from "./routes/game.routes.js";
import uploadRouter from "./routes/upload.routes.js";
import adminGameRouter from "./routes/adminGame.routes.js";
import adminPackageRouter from "./routes/adminPackage.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import adminOrderRouter from "./routes/adminOrder.routes.js";
import adminRefundRouter from "./routes/adminRefund.routes.js";
import adminDashboardRouter from "./routes/adminDashboard.routes.js";
import adminUserRouter from "./routes/adminUser.routes.js";
import adminPaymentConfigRouter from "./routes/adminPaymentConfig.routes.js";
import adminAuditLogRouter from "./routes/adminAuditLog.routes.js";

const app = express();

app.set("trust proxy", 1);

app.use(httpLogger);

app.use(helmet());

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
    exposedHeaders: ["X-Request-Id"],
    maxAge: 600,
  }),
);

app.use("/api/webhooks", webhookRouter);

app.use(express.json({ limit: "10kb" }));

app.use(arcjetProtect);

app.use(
  clerkMiddleware({
    secretKey: ENV.CLERK.SECRET_KEY,
    publishableKey: ENV.CLERK.PUBLISHABLE_KEY,
  }),
);

app.get("/", (_req: Request, res: Response) => {
  res.json({ data: { name: "Opulent API", version: "1.0.0" } });
});

app.use("/api/health", healthRouter);
app.use("/api/users", userRouter);
app.use("/api/admin/team", adminTeamRouter);
app.use("/api/games", gameRouter);
app.use("/api/admin/uploads", uploadRouter);
app.use("/api/admin/games", adminGameRouter);
app.use("/api/admin/packages", adminPackageRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/refunds", adminRefundRouter);
app.use("/api/admin/dashboard", adminDashboardRouter);
app.use("/api/admin/users", adminUserRouter);
app.use("/api/admin/payment-config", adminPaymentConfigRouter);
app.use("/api/admin/audit-logs", adminAuditLogRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await connectDB();

    const port = Number(ENV.PORT);

    const server = app.listen(port, () => {
      logger.info(`Opulent API running on http://localhost:${port}`);
      logger.info(`Environment: ${ENV.NODE_ENV}`);
    });

    if (ENV.RUN_SCHEDULER) startScheduler();

    const shutdown = (signal: string): void => {
      logger.info({ signal }, "Shutting down");
      const force = setTimeout(() => process.exit(1), 10_000);
      force.unref();
      server.close(() => {
        void disconnectDB().finally(() => process.exit(0));
      });
    };
    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

    process.on("unhandledRejection", (reason) => {
      logger.fatal({ err: reason }, "Unhandled promise rejection");
      process.exit(1);
    });
    process.on("uncaughtException", (err) => {
      logger.fatal({ err }, "Uncaught exception");
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ err: error }, "Failed to start server");
    process.exit(1);
  }
};

start();
