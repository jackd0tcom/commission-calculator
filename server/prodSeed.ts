import { configDotenv } from "dotenv";
import { db, Product, Vendor, VendorField, Client } from "./model.js";

configDotenv();

const SEED_PRODUCTS = [
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
  { productName: "DPR", cost: 6700, defaultPrice: 15000, commissionRate: 0.05 },
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
  { productName: "Schema", cost: 60, defaultPrice: 300, commissionRate: 0.05 },
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
  { productName: "AIO", cost: 1000, defaultPrice: 9000, commissionRate: 0.05 },
];

const vendors = await Vendor.bulkCreate([
  {
    vendorName: "Interior",
    googleSheetId: null,
  },
  {
    vendorName: "Next Net",
    googleSheetId: "1BxSeEdSeEd-demo-sheet-primary",
  },
  {
    vendorName: "Vissoula",
    googleSheetId: null,
  },
]);

await VendorField.bulkCreate([
  {
    vendorId: 2,
    label: "P1P Team",
    fieldType: "string",
    required: true,
    sortIndex: 1,
    defaultValue: null,
    googleSheetId: "B",
  },
  {
    vendorId: 2,
    label: "Client ID",
    fieldType: "number",
    required: true,
    sortIndex: 2,
    defaultValue: null,
    googleSheetId: "C",
  },
  {
    vendorId: 2,
    label: "Client",
    fieldType: "string",
    required: true,
    sortIndex: 3,
    defaultValue: null,
    googleSheetId: "D",
  },
  {
    vendorId: 2,
    label: "Target Pages",
    fieldType: "string",
    required: false,
    sortIndex: 5,
    defaultValue: null,
    googleSheetId: "F",
  },
  {
    vendorId: 2,
    label: "Target Page Chosen",
    fieldType: "string",
    required: false,
    sortIndex: 6,
    defaultValue: null,
    googleSheetId: "G",
  },
  {
    vendorId: 2,
    label: "P1P Suggested Anchor Text",
    fieldType: "string",
    required: false,
    sortIndex: 7,
    defaultValue: null,
    googleSheetId: "H",
  },
  {
    vendorId: 3,
    label: "Campaign code",
    fieldType: "string",
    required: false,
    sortIndex: 0,
    defaultValue: null,
    googleSheetId: "C",
  },
]);

const clients = await Client.bulkCreate([
  { clientName: "Acme Corp", userId: 1, isArchived: false },
  { clientName: "Globex Industries", userId: 1, isArchived: false },
]);

async function seed() {
  await db.sync({ alter: true, force: true });

  let created = 0;
  for (const row of SEED_PRODUCTS) {
    const [, wasCreated] = await Product.findOrCreate({
      where: { productName: row.productName },
      defaults: {
        cost: row.cost,
        defaultPrice: row.defaultPrice,
        commissionRate: row.commissionRate,
      },
    });
    if (wasCreated) created++;
  }

  console.log(
    `Prod seed done: ${created} new product(s) added (existing left unchanged)`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
