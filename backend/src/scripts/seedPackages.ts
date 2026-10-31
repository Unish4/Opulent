import { connectDB, disconnectDB } from "../config/db.js";
import { Game } from "../models/Game.js";
import { Package, type PackageType } from "../models/Package.js";

interface Item {
  name: string;
  price: number;
  description?: string;
  badge?: string;
}

interface Group {
  group: string;
  type: PackageType;
  items: Item[];
}

const amounts = (suffix: string, rows: [number | string, number][]): Item[] =>
  rows.map(([amount, price]) => ({
    name: `${typeof amount === "number" ? amount.toLocaleString("en-US") : amount} ${suffix}`,
    price,
  }));

const catalog: Record<string, Group[]> = {
  "mobile-legends": [
    {
      group: "Diamonds",
      type: "topup",
      items: amounts("Diamonds", [
        [55, 140],
        [86, 250],
        [165, 445],
        [172, 480],
        [257, 680],
        [275, 735],
        [565, 1500],
        [706, 1850],
        [1130, 3000],
        [2195, 6000],
        [3688, 9200],
        [5532, 14000],
        [9288, 23000],
      ]),
    },
    {
      group: "Subscriptions",
      type: "pass",
      items: [
        { name: "Weekly Pass", price: 305 },
        { name: "2X Weekly Pass", price: 600 },
        { name: "Twilight Pass", price: 1700 },
      ],
    },
    {
      group: "Packs",
      type: "bundle",
      items: [
        { name: "Elite Weekly Pack", price: 190 },
        { name: "Epic Monthly Pack", price: 850 },
      ],
    },
  ],
  "pubg-mobile": [
    {
      group: "UC",
      type: "topup",
      items: amounts("UC", [
        [60, 170],
        [120, 340],
        [325, 850],
        [385, 1130],
        [660, 1650],
        [985, 2450],
        [1800, 4200],
        [3850, 8100],
        [8100, 16500],
      ]),
    },
    {
      group: "Subscriptions",
      type: "pass",
      items: [
        { name: "Prime", price: 210 },
        { name: "Prime Plus", price: 1800 },
      ],
    },
  ],
  "free-fire": [
    {
      group: "Diamonds",
      type: "topup",
      items: amounts("Diamonds", [
        [25, 40],
        [50, 70],
        [115, 115],
        [240, 230],
        [355, 340],
        [480, 450],
        [610, 570],
        [725, 680],
        [850, 810],
        [960, 910],
        [1090, 1150],
        [1240, 1200],
        [2530, 2300],
        [5060, 4800],
        [7590, 7000],
        [10120, 9200],
      ]),
    },
    {
      group: "Special Packs",
      type: "bundle",
      items: [
        { name: "Weekly", price: 240 },
        { name: "Monthly", price: 1150 },
        { name: "Weekly Lite", price: 100 },
        { name: "Weekly + Monthly Combo", price: 1300 },
      ],
    },
    {
      group: "Level Up Pack",
      type: "bundle",
      items: [
        { name: "Level 6", description: "120 Diamonds", price: 90 },
        { name: "Level 10", description: "200 Diamonds", price: 105 },
        { name: "Level 15", description: "200 Diamonds", price: 110 },
        { name: "Level 20", description: "200 Diamonds", price: 115 },
        { name: "Level 25", description: "200 Diamonds", price: 120 },
        { name: "Level 30", description: "350 Diamonds", price: 170 },
      ],
    },
  ],
  "clash-of-clans": [
    {
      group: "Passes",
      type: "pass",
      items: [{ name: "Gold Pass", price: 1300 }],
    },
    {
      group: "Gems",
      type: "topup",
      items: amounts("Gems", [
        [80, 140],
        [500, 700],
        [1200, 1300],
        [2500, 2600],
        [6500, 6000],
        [14000, 13500],
      ]),
    },
  ],
  efootball: [
    {
      group: "Starter Sets",
      type: "bundle",
      items: [
        {
          name: "Starter Set 1",
          description: "Luis Suarez + Coins",
          price: 255,
        },
        {
          name: "Starter Set",
          description: "Iker Casillas + 100 Coins",
          price: 590,
          badge: "Popular",
        },
      ],
    },
    {
      group: "Coins",
      type: "topup",
      items: [
        { name: "100 Coins", description: "3 free coins included", price: 290 },
        { name: "300 Coins", description: "9 free coins included", price: 780 },
        {
          name: "500 Coins",
          description: "23 free coins included",
          price: 999,
        },
        {
          name: "1,000 Coins",
          description: "63 free coins included",
          price: 1890,
        },
        {
          name: "2,000 Coins",
          description: "158 free coins included",
          price: 3780,
        },
        {
          name: "3,000 Coins",
          description: "334 free coins included",
          price: 4500,
        },
        {
          name: "5,000 Coins",
          description: "719 free coins included",
          price: 7500,
        },
        {
          name: "10,000 Coins",
          description: "1,922 free coins included",
          price: 14220,
        },
        {
          name: "15,000 Coins",
          description: "3,045 free coins included",
          price: 20930,
          badge: "Best Value",
        },
      ],
    },
  ],
  roblox: [
    {
      group: "Robux",
      type: "topup",
      items: amounts("Robux", [
        [40, 95],
        [80, 185],
        [400, 910],
        [500, 965],
        [800, 1850],
        [1000, 1900],
        [1200, 2800],
        [1500, 2850],
        [1700, 3700],
        [2000, 3750],
        [3150, 6450],
        [3625, 6550],
        [4500, 9200],
        [5250, 9300],
        ["10k", 18350],
        ["11k", 18400],
        ["24k", 36400],
      ]),
    },
  ],
};

const run = async (): Promise<void> => {
  await connectDB();

  for (const [slug, groups] of Object.entries(catalog)) {
    const game = await Game.findOne({ slug });
    if (!game) {
      console.log(`${slug}: game not found, run seed:games first`);
      continue;
    }

    let order = 0;
    let created = 0;
    for (const { group, type, items } of groups) {
      for (const item of items) {
        order += 10;
        const result = await Package.updateOne(
          { gameId: game._id, name: item.name },
          {
            $setOnInsert: {
              gameId: game._id,
              group,
              name: item.name,
              type,
              description: item.description,
              badge: item.badge,
              pricePaisa: item.price * 100,
              isAvailable: true,
              sortOrder: order,
            },
          },
          { upsert: true },
        );
        if (result.upsertedCount > 0) created += 1;
      }
    }
    console.log(`${slug}: ${created} packages created`);
  }
};

run()
  .catch((err) => {
    console.error(
      "seed:packages failed:",
      err instanceof Error ? err.message : err,
    );
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
