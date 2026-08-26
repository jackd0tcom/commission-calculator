import ViteExpress from "vite-express";
import { createApp } from "./app.js";
import { db } from "./model.js";

const app = createApp();
const PORT: number = Number(process.env.PORT) || 2020;

const shouldAlterSchema = process.env.NODE_ENV !== "production";
await db.sync(shouldAlterSchema ? { alter: true } : undefined);

console.log("Database synced");

ViteExpress.listen(app, PORT, () => {
  console.log(
    `live on http://localhost:${PORT} ${
      process.env.NODE_ENV === "production" ? "production" : "development"
    }`,
  );
});
