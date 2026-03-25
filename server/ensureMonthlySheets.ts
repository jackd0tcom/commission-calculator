/**
 * Run the same month sheet creation as the cron job, on demand.
 * Load .env first so DATABASE_URL matches the app.
 *
 *   npx tsx server/ensureMonthlySheets.ts
 *   npm run ensure-monthly-sheets
 *
 * Uses COMMISSION_SHEET_TIMEZONE if set (must match cron / deliver-to-sheet logic).
 */
import { configDotenv } from "dotenv";

configDotenv();

const { ensureMonthlySheetsForAllowedUsers, formatMonthlySheetTitle } =
    await import("./commissionSheets.js");
await import("./model.js");

const title = formatMonthlySheetTitle();
console.log(`Ensuring monthly sheets for: "${title}"`);

await ensureMonthlySheetsForAllowedUsers();

console.log("Done.");
process.exit(0);