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

  console.log(`Seeded ${clients.length} clients`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
