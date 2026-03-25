import cron from "node-cron";
import { ensureMonthlySheetsForAllowedUsers } from "./commissionSheets";

export function startMonthlyCommissionSheetCron() {
  if (process.env.DISABLE_MONTHLY_SHEET_CRON === "1") {
    console.log(
      "[monthly-sheets] cron disabled via DISABLE_MONTHLY_SHEET_CRON",
    );
    return;
  }

  const tz = process.env.COMMISSION_SHEET_TIMEZONE;
  const options = tz ? { timezone: tz } : {};

  cron.schedule(
    "0 2 1 * *",
    async () => {
      try {
        await ensureMonthlySheetsForAllowedUsers();
        console.log(
          "[monthly-sheets] ensured sheets for",
          new Date().toISOString(),
        );
      } catch (err) {
        console.error("[monthly-sheets] job failed:", err);
      }
    },
    options,
  );

  console.log(
    `[monthly-sheets] scheduled: 2:00 on the 1st (${tz ? `timezone ${tz}` : "server local timezone"})`,
  );
}
