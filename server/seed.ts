import { configDotenv } from "dotenv";
import {
    db,
    Client,
    Product,
    CommissionSheet,
    CommissionItem,
} from "./model.js";

configDotenv();

async function seed() {
    await db.sync({ force: true });

    const clients = await Client.bulkCreate([
        { clientName: "Acme Corp" },
        { clientName: "Globex Industries" },
        { clientName: "Initech" },
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
    ]);

    const sheets = await CommissionSheet.bulkCreate([
        {
            userId: 101,
            sheetTitle: "January 2025 Commissions",
            sheetDescription: "Q1 kickoff sales",
            sheetStatus: "submitted",
        },
        {
            userId: 101,
            sheetTitle: "February Draft",
            sheetDescription: null,
            sheetStatus: "draft",
        },
        {
            userId: 102,
            sheetTitle: "January 2025 Commissions",
            sheetDescription: null,
            sheetStatus: "archived",
        },
    ]);

    await CommissionItem.bulkCreate([
        { sheetId: 1, quantity: 3, productId: 1, price: 24.99 },
        { sheetId: 1, quantity: 1, productId: 2, price: 49.99 },
        { sheetId: 1, quantity: 2, productId: 3, price: 139.99 },
        { sheetId: 2, quantity: 5, productId: 1, price: 22.0 },
        { sheetId: 2, quantity: 2, productId: 3, price: 149.99 },
        { sheetId: 3, quantity: 10, productId: 1, price: 24.99 },
    ]);

    console.log(
        `Seeded ${clients.length} clients, ${products.length} products, ${sheets.length} commission sheets, 6 commission items.`,
    );
    process.exit(0);
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
