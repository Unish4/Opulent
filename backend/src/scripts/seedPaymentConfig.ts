import { connectDB, disconnectDB } from "../config/db.js";
import { PaymentConfig } from "../models/PaymentConfig.js";

const qrImageUrl = process.argv[2];

const run = async (): Promise<void> => {
  if (!qrImageUrl || !qrImageUrl.startsWith("https://res.cloudinary.com/")) {
    console.log(
      'Usage: npm run seed:payment -- "https://res.cloudinary.com/..."',
    );
    process.exitCode = 1;
    return;
  }

  await connectDB();
  await PaymentConfig.findOneAndUpdate(
    { key: "default" },
    {
      $set: {
        methodLabel: "fonepay",
        recipientName: "BIKRAM PD SHRESTHA",
        qrImageUrl,
        whatsappNumber: "9779767485665",
        instructions:
          "Open eSewa or any digital wallet and scan the QR code.\nPay the exact amount shown for your order.\nIf eSewa has a remarks field, write your order ID there.\nTake a screenshot of the completed payment.",
      },
    },
    { upsert: true, new: true, runValidators: true },
  );
  console.log("Payment details saved.");
};

run()
  .catch((err) => {
    console.error(
      "seed:payment failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
