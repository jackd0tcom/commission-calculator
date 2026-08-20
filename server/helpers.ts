import { formatMonthlySheetTitle } from "./commissionSheets";
import { CommissionSheet } from "./model";
import { createHmac, timingSafeEqual } from "crypto";

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

export function verify(
  secret: string,
  signatureHeader: string,
  rawBody: Buffer | string,
  toleranceSeconds = 300,
): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=", 2) as [string, string]),
  );

  const timestamp = Number(parts["t"]);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const body = typeof rawBody === "string" ? Buffer.from(rawBody) : rawBody;
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(body)
    .digest("hex");

  // Header may carry more than one v1= during secret rotation; accept if any matches.
  const provided = signatureHeader
    .split(",")
    .map((p) => p.split("=", 2))
    .filter(([k]) => k === "v1")
    .map(([, v]) => v);

  const expectedBuf = Buffer.from(expected, "utf8");
  return provided.some((p) => {
    const providedBuf = Buffer.from(p, "utf8");
    return (
      expectedBuf.length === providedBuf.length &&
      timingSafeEqual(expectedBuf, providedBuf)
    );
  });
}
