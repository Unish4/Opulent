import { connectDB, disconnectDB } from "../config/db.js";
import { Game, type IPlayerField } from "../models/Game.js";

const loginField = (
  label: string,
  placeholder: string,
  helpText: string,
): IPlayerField => ({
  key: "login",
  label,
  placeholder,
  helpText,
  required: true,
  ruleType: "text",
  minLength: 3,
  maxLength: 100,
});

const passwordField: IPlayerField = {
  key: "password",
  label: "Account password",
  placeholder: "Your account password",
  helpText:
    "Only our team can see it while your order is processed. It is stored encrypted and deleted when the order is finished.",
  required: true,
  ruleType: "text",
  minLength: 4,
  maxLength: 100,
};

const NOTE =
  "Our team signs in to your account only to complete this top-up. Never send your password in a WhatsApp message, and change it after the top-up.";

const updates = [
  {
    slug: "roblox",
    instructions: `Enter the username or email of your Roblox account and its password. ${NOTE}`,
    playerFields: [
      loginField(
        "Roblox username or email",
        "Username or email",
        "The account that should receive the Robux.",
      ),
      passwordField,
    ],
  },
  {
    slug: "efootball",
    instructions: `Enter your eFootball ID and the login and password of the account. ${NOTE}`,
    playerFields: [
      {
        key: "playerId",
        label: "eFootball ID",
        placeholder: "Enter your eFootball ID",
        helpText: "Copy it exactly as shown in the game.",
        required: true,
        ruleType: "text",
        minLength: 3,
        maxLength: 30,
      } as IPlayerField,
      loginField(
        "Konami ID or email",
        "Konami ID or email",
        "The login you use for eFootball.",
      ),
      passwordField,
    ],
  },
];

const run = async (): Promise<void> => {
  await connectDB();

  for (const update of updates) {
    const game = await Game.findOne({ slug: update.slug });
    if (!game) {
      console.log(`${update.slug}: game not found, run seed:games first`);
      continue;
    }
    game.playerFields = update.playerFields;
    game.instructions = update.instructions;
    await game.save();
    console.log(`${update.slug}: updated`);
  }
};

run()
  .catch((err) => {
    console.error(
      "seed:credentials failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
