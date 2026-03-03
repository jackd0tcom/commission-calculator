import { configDotenv } from "dotenv";
import {
  db,
  User,
  Client,
  Product,
  CommissionSheet,
  CommissionItem,
} from "./model.js";

configDotenv();

async function seed() {
  await db.sync({ force: true });

  // Create userId 1 so FKs (clients, commission_sheets) are satisfied.
  // Set SEED_AUTH0_ID to your Auth0 sub so this user is "you" when you log in.
  const seedAuth0Id = process.env.SEED_AUTH0_ID || "auth0|seed-placeholder";
  await User.bulkCreate([
    {
      auth0Id: seedAuth0Id,
      email: "seed@example.com",
      firstName: "Seed",
      lastName: "User",
      isAdmin: true,
      isAllowed: true,
    },
  ]);

  const clients = await Client.bulkCreate([
    { clientName: "Acme Corp", userId: 1, isArchived: false },
    { clientName: "Globex Industries", userId: 1, isArchived: false },
    { clientName: "Initech", userId: 1, isArchived: false },
    { clientName: "Umbrella Corp", userId: 1, isArchived: false },
    { clientName: "Stark Industries", userId: 1, isArchived: false },
    { clientName: "Wayne Enterprises", userId: 1, isArchived: false },
    { clientName: "Cyberdyne Systems", userId: 1, isArchived: false },
    { clientName: "Wonka Industries", userId: 1, isArchived: false },
    { clientName: "Dunder Mifflin", userId: 1, isArchived: false },
    { clientName: "Pied Piper", userId: 1, isArchived: false },
  ]);

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

  const sheets = await CommissionSheet.bulkCreate([
    {
      userId: 1,
      sheetTitle: "January 2025 Commissions",
      sheetDescription: "Q1 kickoff sales",
      sheetStatus: "submitted",
    },
    {
      userId: 1,
      sheetTitle: "February 2025 Draft",
      sheetDescription: null,
      sheetStatus: "draft",
    },
    {
      userId: 1,
      sheetTitle: "December 2024 Commissions",
      sheetDescription: "Year-end",
      sheetStatus: "approved",
    },
    {
      userId: 1,
      sheetTitle: "March 2025 Commissions",
      sheetDescription: "Q1 close",
      sheetStatus: "submitted",
    },
    {
      userId: 1,
      sheetTitle: "April 2025 Draft",
      sheetDescription: null,
      sheetStatus: "draft",
    },
    {
      userId: 1,
      sheetTitle: "November 2024 Commissions",
      sheetDescription: null,
      sheetStatus: "approved",
    },
    {
      userId: 1,
      sheetTitle: "May 2025 Commissions",
      sheetDescription: "Q2 kickoff",
      sheetStatus: "submitted",
    },
    {
      userId: 1,
      sheetTitle: "June 2025 Draft",
      sheetDescription: "In progress",
      sheetStatus: "draft",
    },
    {
      userId: 1,
      sheetTitle: "October 2024 Commissions",
      sheetDescription: null,
      sheetStatus: "approved",
    },
    {
      userId: 1,
      sheetTitle: "Q2 2025 Summary",
      sheetDescription: "Quarterly review",
      sheetStatus: "submitted",
    },
    {
      userId: 1,
      sheetTitle: "July 2025 Draft",
      sheetDescription: null,
      sheetStatus: "draft",
    },
    {
      userId: 1,
      sheetTitle: "September 2024 Commissions",
      sheetDescription: null,
      sheetStatus: "approved",
    },
    {
      userId: 1,
      sheetTitle: "October 2028 Commissions",
      sheetDescription: null,
      sheetStatus: "approved",
    },
    {
      userId: 1,
      sheetTitle: "September 2030 Commissions",
      sheetDescription: null,
      sheetStatus: "approved",
    },
  ]);

  const items = await CommissionItem.bulkCreate([
    { sheetId: 1, quantity: 3, productId: 1, price: 24.99, clientId: 1 },
    { sheetId: 1, quantity: 1, productId: 2, price: 49.99, clientId: 2 },
    { sheetId: 1, quantity: 2, productId: 3, price: 139.99, clientId: 1 },
    { sheetId: 1, quantity: 1, productId: 4, price: 499.99, clientId: 3 },
    { sheetId: 2, quantity: 5, productId: 1, price: 22.0, clientId: 1 },
    { sheetId: 2, quantity: 2, productId: 3, price: 149.99, clientId: 2 },
    { sheetId: 2, quantity: 4, productId: 5, price: 39.99, clientId: 4 },
    { sheetId: 3, quantity: 10, productId: 1, price: 24.99, clientId: 1 },
    { sheetId: 3, quantity: 1, productId: 8, price: 1999.99, clientId: 5 },
    { sheetId: 4, quantity: 2, productId: 2, price: 49.99, clientId: 2 },
    { sheetId: 4, quantity: 1, productId: 6, price: 99.99, clientId: 6 },
    { sheetId: 4, quantity: 3, productId: 7, price: 249.99, clientId: 1 },
    { sheetId: 5, quantity: 8, productId: 1, price: 24.99, clientId: 7 },
    { sheetId: 5, quantity: 1, productId: 3, price: 149.99, clientId: 8 },
    { sheetId: 6, quantity: 6, productId: 5, price: 35.0, clientId: 9 },
    { sheetId: 6, quantity: 2, productId: 4, price: 449.99, clientId: 10 },
    { sheetId: 7, quantity: 4, productId: 2, price: 49.99, clientId: 3 },
    { sheetId: 7, quantity: 1, productId: 8, price: 1999.99, clientId: 4 },
    { sheetId: 8, quantity: 12, productId: 1, price: 24.99, clientId: 5 },
    { sheetId: 8, quantity: 2, productId: 6, price: 99.99, clientId: 6 },
    { sheetId: 9, quantity: 1, productId: 4, price: 499.99, clientId: 7 },
    { sheetId: 9, quantity: 5, productId: 3, price: 139.99, clientId: 8 },
    { sheetId: 10, quantity: 3, productId: 7, price: 249.99, clientId: 9 },
    { sheetId: 10, quantity: 2, productId: 5, price: 39.99, clientId: 10 },
    { sheetId: 11, quantity: 7, productId: 1, price: 24.99, clientId: 1 },
    { sheetId: 11, quantity: 1, productId: 2, price: 49.99, clientId: 2 },
    { sheetId: 12, quantity: 4, productId: 3, price: 149.99, clientId: 3 },
    { sheetId: 12, quantity: 1, productId: 8, price: 1999.99, clientId: 4 },
  ]);

  console.log(
    `Seeded 1 user, ${clients.length} clients, ${products.length} products, ${sheets.length} commission sheets, ${items.length} commission items.`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
