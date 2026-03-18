import { configDotenv } from "dotenv";
import {
  db,
  User,
  Client,
  Product,
  CommissionSheet,
  UserProductCommission,
} from "./model.js";

configDotenv();

async function seed() {
  await db.sync();

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

  const commissionRates = await UserProductCommission.bulkCreate([
    { userId: 1, productId: 1, commissionRate: 0.1 },
    { userId: 1, productId: 2, commissionRate: 0.2 },
    { userId: 1, productId: 3, commissionRate: 0.3 },
    { userId: 1, productId: 4, commissionRate: 0.15 },
    { userId: 1, productId: 5, commissionRate: 0.12 },
    { userId: 1, productId: 6, commissionRate: 0.08 },
  ]);

  console.log(
    `Seeded ${clients.length} clients and ${commissionRates.length} commission rates`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
