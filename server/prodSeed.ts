import "dotenv/config";
import {
  db,
  Product,
  Vendor,
  VendorProduct,
  VendorField,
  Client,
} from "./model.js";

const productSeedData = [
  {
    productName: "Editorial Links",
    cost: 250,
    defaultPrice: 600,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Expert Links",
    cost: 1400,
    defaultPrice: 5000,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Digital PR",
    cost: 6700,
    defaultPrice: 15000,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "News Links",
    cost: 500,
    defaultPrice: 900,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Foundational Links",
    cost: 400,
    defaultPrice: 1200,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Hourly Link Building",
    cost: 30,
    defaultPrice: 100,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "News Syndications",
    cost: 75,
    defaultPrice: 125,
    commissionRate: 0.05,
    linkEstimate: 1,

    productType: "link building services",
  },
  {
    productName: "Media Blitz",
    cost: 2200,
    defaultPrice: 7500,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "3 Month Campaign",
    cost: 150,
    defaultPrice: 9000,
    commissionRate: 0.05,
    productType: "ai search optimization",
  },
  {
    productName: "AI Authoritative Content Creation",
    cost: 150,
    defaultPrice: 750,
    commissionRate: 0.05,
    productType: "ai search optimization",
  },
  {
    productName: "Passage Level Content Refresh",
    cost: 150,
    defaultPrice: 350,
    commissionRate: 0.05,
    productType: "ai search optimization",
  },
  {
    productName: "SEO Blog Content",
    cost: 150,
    defaultPrice: 500,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "SEO Strategic Revision",
    cost: 150,
    defaultPrice: 500,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Content Audit and Roadmap",
    cost: 150,
    defaultPrice: 3800,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Advanced Content",
    cost: 150,
    defaultPrice: 1250,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Wikipedia Feasibility Assessment",
    cost: 150,
    defaultPrice: 500,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Wikipedia Page Creation",
    cost: 150,
    defaultPrice: 5000,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Website Audit",
    cost: 500,
    defaultPrice: 3500,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "Schema Optimization",
    cost: 60,
    defaultPrice: 300,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "Crawl Optimization",
    cost: 50,
    defaultPrice: 1500,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "On-Page Optimization",
    cost: 300,
    defaultPrice: 200,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "Internal Link Optimization",
    cost: 1000,
    defaultPrice: 2000,
    commissionRate: 0.05,
    productType: "technical services",
  },
];

const vendorSeedData = [
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
];

const vendorProductSeedData = [
  {
    vendorId: 2,
    productId: 1,
  },
  {
    vendorId: 2,
    productId: 16,
  },
  {
    vendorId: 3,
    productId: 3,
  },
  {
    vendorId: 3,
    productId: 1,
  },
];

const vendorFieldSeedData = [
  {
    vendorProductId: 2,
    label: "P1P Team",
    fieldType: "string",
    required: true,
    sortIndex: 1,
    defaultValue: null,
    googleSheetId: "B",
  },
  {
    vendorProductId: 2,
    label: "Client ID",
    fieldType: "number",
    required: true,
    sortIndex: 2,
    defaultValue: null,
    googleSheetId: "C",
  },
  {
    vendorProductId: 2,
    label: "Client",
    fieldType: "string",
    required: true,
    sortIndex: 3,
    defaultValue: null,
    googleSheetId: "D",
  },
  {
    vendorProductId: 2,
    label: "Target Pages",
    fieldType: "string",
    required: false,
    sortIndex: 5,
    defaultValue: null,
    googleSheetId: "F",
  },
  {
    vendorProductId: 2,
    label: "Target Page Chosen",
    fieldType: "string",
    required: false,
    sortIndex: 6,
    defaultValue: null,
    googleSheetId: "G",
  },
  {
    vendorProductId: 2,
    label: "P1P Suggested Anchor Text",
    fieldType: "string",
    required: false,
    sortIndex: 7,
    defaultValue: null,
    googleSheetId: "H",
  },
  {
    vendorProductId: 3,
    label: "Campaign code",
    fieldType: "string",
    required: false,
    sortIndex: 0,
    defaultValue: null,
    googleSheetId: "C",
  },
];

const clientSeedData = [
  { clientName: "Acme Corp", userId: 1, isArchived: false },
  { clientName: "Globex Industries", userId: 1, isArchived: false },
];

async function seed() {
  await db.sync({ force: true });

  const products = await Product.bulkCreate(productSeedData);
  const vendors = await Vendor.bulkCreate(vendorSeedData);
  await VendorProduct.bulkCreate(vendorProductSeedData);
  await VendorField.bulkCreate(vendorFieldSeedData);
  const clients = await Client.bulkCreate(clientSeedData);

  console.log(
    `Prod seed done: ${products.length} new product(s) added, ${clients.length} clients, and ${vendors.length} vendors`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
