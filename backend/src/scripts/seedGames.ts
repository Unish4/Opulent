import { connectDB, disconnectDB } from "../config/db.js";
import { Game, type FieldRuleType, type IPlayerField } from "../models/Game.js";

const SAFETY_NOTE =
  "Never share your password or verification codes. Our team will never ask for them.";

const idField = (
  label: string,
  placeholder: string,
  helpText: string,
  minLength = 5,
  maxLength = 20,
  ruleType: FieldRuleType = "digits",
): IPlayerField => ({
  key: "playerId",
  label,
  placeholder,
  helpText,
  required: true,
  ruleType,
  minLength,
  maxLength,
});

const serverField: IPlayerField = {
  key: "serverId",
  label: "Server ID",
  placeholder: "Zone ID, e.g. 2001",
  helpText: "The number in brackets next to your User ID.",
  required: true,
  ruleType: "digits",
  minLength: 1,
  maxLength: 6,
};

const nameField: IPlayerField = {
  key: "playerName",
  label: "In-game name",
  placeholder: "Your nickname in the game",
  helpText: "Used by our team to double-check the account before topping up.",
  required: true,
  ruleType: "text",
  minLength: 1,
  maxLength: 40,
};

const emailField: IPlayerField = {
  key: "email",
  label: "Account email",
  placeholder: "you@example.com",
  helpText: "The email address linked to your game account.",
  required: true,
  ruleType: "email",
  minLength: 5,
  maxLength: 100,
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
      idField("Player UID", "Enter your Free Fire UID", "Numbers only."),
      nameField,
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
      idField("Character ID", "Enter your Character ID", "Numbers only."),
      nameField,
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
      idField("User ID", "Enter your User ID", "Numbers only."),
      serverField,
      nameField,
    ],
    isFeatured: true,
    sortOrder: 3,
  },
  {
    name: "Clash of Clans",
    slug: "clash-of-clans",
    aliases: ["coc", "clash", "gems", "supercell"],
    publisher: "Supercell",
    description: "Top up Clash of Clans gems and passes.",
    instructions: `Enter the email address linked to your Clash of Clans account. ${SAFETY_NOTE}`,
    playerFields: [emailField],
    isFeatured: false,
    sortOrder: 4,
  },
  {
    name: "eFootball",
    slug: "efootball",
    aliases: ["pes", "pes 2026", "efootball 2026", "coins"],
    publisher: "Konami",
    description: "Top up eFootball coins and starter sets.",
    instructions: `Enter your eFootball ID exactly as shown in the game. ${SAFETY_NOTE}`,
    playerFields: [
      idField(
        "eFootball ID",
        "Enter your eFootball ID",
        "Copy it exactly as shown in the game.",
        3,
        30,
        "text",
      ),
    ],
    isFeatured: false,
    sortOrder: 5,
  },
  {
    name: "Roblox",
    slug: "roblox",
    aliases: ["robux", "rbx"],
    publisher: "Roblox Corporation",
    description: "Top up Robux to your Roblox account.",
    instructions: `Enter the email address linked to your Roblox account. ${SAFETY_NOTE}`,
    playerFields: [emailField],
    isFeatured: false,
    sortOrder: 6,
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
