import { formatMonthlySheetTitle } from "./commissionSheets";
import { CommissionSheet } from "./model";

export async function getOrCreateMonthlySheetForUser(userId: number) {
  const sheetTitle = formatMonthlySheetTitle(
    new Date(),
    process.env.COMMISSION_SHEET_TIMEZONE,
  );
  const [sheet] = await CommissionSheet.findOrCreate({
    where: { userId, sheetTitle },
  });
  return sheet;
}
