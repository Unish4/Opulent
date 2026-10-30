import { connectDB, disconnectDB } from "../config/db.js";
import { Game, type IPlayerField } from "../models/Game.js";

const playerIdField = (
  label: string,
  placeholder: string,
  helpText: string,
): IPlayerField => ({
  key: "playerId",
  label,
  placeholder,
  helpText,
  required: true,
  ruleType: "digits",
  minLength: 5,
  maxLength: 20,
});

const serverIdField: IPlayerField = {
  key: "serverId",
  label: "Server ID",
  placeholder: "Zone ID, e.g. 2001",
  helpText: "The number in brackets next to your User ID.",
  required: true,
  ruleType: "digits",
  minLength: 1,
  maxLength: 6,
};

const playerNameField: IPlayerField = {
  key: "playerName",
  label: "In-game name",
  placeholder: "Your nickname in the game",
  helpText: "Used by our team to double-check the account before topping up.",
  required: true,
  ruleType: "text",
  minLength: 1,
  maxLength: 40,
};

const games = [
  {
    name: "Free Fire",
    slug: "free-fire",
    aliases: ["ff", "freefire", "garena free fire", "diamonds"],
    publisher: "Garena",
    description: "Top up Free Fire diamonds to your account.",
    instructions:
      "Open Free Fire and tap your profile picture in the top-left corner. Your UID is shown under your nickname.",
    playerFields: [
      playerIdField("Player UID", "Enter your Free Fire UID", "Numbers only."),
      playerNameField,
    ],
    isFeatured: true,
    sortOrder: 1,
  },
  {
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    aliases: ["pubg", "pubgm", "uc", "battlegrounds"],
    publisher: "Tencent Games",
    description: "Top up PUBG Mobile UC to your account.",
    instructions:
      "Open PUBG Mobile and tap your profile picture. Your Character ID is shown under your name.",
    playerFields: [
      playerIdField("Character ID", "Enter your Character ID", "Numbers only."),
      playerNameField,
    ],
    isFeatured: true,
    sortOrder: 2,
  },
  {
    name: "Mobile Legends: Bang Bang",
    slug: "mobile-legends",
    aliases: ["mlbb", "ml", "mobile legends", "diamonds"],
    publisher: "Moonton",
    description: "Top up Mobile Legends diamonds to your account.",
    instructions:
      "Open Mobile Legends and tap your profile picture in the top-left. Your User ID and Server ID are shown together; enter them in separate boxes.",
    playerFields: [
      playerIdField("User ID", "Enter your User ID", "Numbers only."),
      serverIdField,
      playerNameField,
    ],
    isFeatured: false,
    sortOrder: 3,
  },
];

const run = async (): Promise<void> => {
  await connectDB();

  for (const data of games) {
    const existing = await Game.findOne({ slug: data.slug });
    if (existing) {
      console.log(`${data.slug}: already exists, skipped`);
      continue;
    }
    await Game.create({
      ...data,
      fulfilmentType: "uid_topup",
      lookup: { enabled: false },
      isPublished: true,
      acceptingOrders: true,
    });
    console.log(`${data.slug}: created`);
  }
};

run()
  .catch((err) => {
    console.error(
      "seed:games failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
