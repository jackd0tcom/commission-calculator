import { CommissionSheet, User } from "./model";

/** e.g. "March 2025" — canonical title for monthly auto-sheets */
export function formatMonthlySheetTitle(
    ref: Date = new Date(),
    timeZone?: string,
): string {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        ...(timeZone ? { timeZone } : {}),
    }).format(ref);
}

export async function createCommissionSheetForUser(params: {
    userId: number;
    sheetTitle: string;
}) {
    return CommissionSheet.create({
        userId: params.userId,
        sheetTitle: params.sheetTitle,
    });
}

/**
 * For each user with isAllowed: true, create a sheet for the month of `now`
 * if one with that title does not already exist.
 */
export async function ensureMonthlySheetsForAllowedUsers(now: Date = new Date()) {
    const tz = process.env.COMMISSION_SHEET_TIMEZONE;
    const title = formatMonthlySheetTitle(now, tz);
    const users = await User.findAll({ where: { isAllowed: true } });

    for (const user of users) {
        const existing = await CommissionSheet.findOne({
            where: { userId: user.userId, sheetTitle: title },
        });
        if (existing) continue;

        await CommissionSheet.create({
            userId: user.userId,
            sheetTitle: title,
        });
    }
}