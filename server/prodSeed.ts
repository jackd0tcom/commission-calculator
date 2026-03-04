import { configDotenv } from "dotenv";
import { db, Product } from "./model.js";

configDotenv();

async function seed() {
  await db.sync();

  const products = await Product.bulkCreate([
    {
      productName: "Editorial Links",
      cost: 250,
      defaultPrice: 600,
      commissionRate: 0.05,
    },
    {
      productName: "Expert Links",
      cost: 1400,
      defaultPrice: 5000,
      commissionRate: 0.05,
    },
    {
      productName: "DPR",
      cost: 6700,
      defaultPrice: 15000,
      commissionRate: 0.05,
    },
    {
      productName: "News Links",
      cost: 500,
      defaultPrice: 900,
      commissionRate: 0.05,
    },
    {
      productName: "Foundation",
      cost: 400,
      defaultPrice: 1200,
      commissionRate: 0.05,
    },
    {
      productName: "Hourly LB",
      cost: 30,
      defaultPrice: 100,
      commissionRate: 0.05,
    },
    {
      productName: "News Syndications",
      cost: 75,
      defaultPrice: 125,
      commissionRate: 0.05,
    },
    {
      productName: "Media Blitz",
      cost: 2200,
      defaultPrice: 7500,
      commissionRate: 0.05,
    },
    {
      productName: "Linkable Content",
      cost: 150,
      defaultPrice: 700,
      commissionRate: 0.05,
    },
    {
      productName: "Keyword Content",
      cost: 150,
      defaultPrice: 700,
      commissionRate: 0.05,
    },
    {
      productName: "Content Roadmap",
      cost: 150,
      defaultPrice: 1500,
      commissionRate: 0.05,
    },
    {
      productName: "Strategic Revision",
      cost: 1500,
      defaultPrice: 800,
      commissionRate: 0.05,
    },
    {
      productName: "Content Audit",
      cost: 300,
      defaultPrice: 1200,
      commissionRate: 0.05,
    },
    {
      productName: "Advanced Content",
      cost: 300,
      defaultPrice: 1200,
      commissionRate: 0.05,
    },
    {
      productName: "Website Audit",
      cost: 500,
      defaultPrice: 2500,
      commissionRate: 0.05,
    },
    {
      productName: "Schema",
      cost: 60,
      defaultPrice: 300,
      commissionRate: 0.05,
    },
    {
      productName: "On Page Optimization",
      cost: 50,
      defaultPrice: 150,
      commissionRate: 0.05,
    },
    {
      productName: "Internal Link Optimization",
      cost: 300,
      defaultPrice: 2000,
      commissionRate: 0.05,
    },
    {
      productName: "AIO",
      cost: 1000,
      defaultPrice: 9000,
      commissionRate: 0.05,
    },
  ]);

  console.log(`Seeded ${products.length} products`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
