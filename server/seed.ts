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
    { clientName: "Acme Corp", userId: 1 },
    { clientName: "Globex Industries", userId: 1 },
    { clientName: "Initech", userId: 1 },
    { clientName: "Umbrella Corp", userId: 1 },
    { clientName: "Stark Industries", userId: 1 },
    { clientName: "Wayne Enterprises", userId: 1 },
    { clientName: "Cyberdyne Systems", userId: 1 },
    { clientName: "Wonka Industries", userId: 1 },
    { clientName: "Dunder Mifflin", userId: 1 },
    { clientName: "Pied Piper", userId: 1 },
  ]);

  const products = await Product.bulkCreate([
    {
      productName: "Widget A",
      cost: 10.0,
      defaultPrice: 24.99,
      commissionRate: 0.1,
      spiff: 5.0,
    },
    {
      productName: "Widget B",
      cost: 25.0,
      defaultPrice: 49.99,
      commissionRate: 0.15,
      spiff: null,
    },
    {
      productName: "Premium Bundle",
      cost: 75.0,
      defaultPrice: 149.99,
      commissionRate: 0.2,
      spiff: 25.0,
    },
    {
      productName: "Enterprise License",
      cost: 200.0,
      defaultPrice: 499.99,
      commissionRate: 0.12,
      spiff: 50.0,
    },
    {
      productName: "Starter Kit",
      cost: 15.0,
      defaultPrice: 39.99,
      commissionRate: 0.08,
      spiff: 10.0,
    },
    {
      productName: "Pro Add-on",
      cost: 45.0,
      defaultPrice: 99.99,
      commissionRate: 0.18,
      spiff: 15.0,
    },
    {
      productName: "Annual Support",
      cost: 100.0,
      defaultPrice: 249.99,
      commissionRate: 0.1,
      spiff: null,
    },
    {
      productName: "Consulting Package",
      cost: 0,
      defaultPrice: 1999.99,
      commissionRate: 0.25,
      spiff: 100.0,
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
      sheetStatus: "archived",
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
      sheetStatus: "archived",
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
      sheetStatus: "archived",
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
      sheetStatus: "archived",
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
