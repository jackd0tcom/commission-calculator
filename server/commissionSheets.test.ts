import { describe, expect, it, vi } from "vitest";

vi.mock("./model", () => ({
  CommissionSheet: {},
  User: {},
}));

import { formatMonthlySheetTitle } from "./commissionSheets";

describe("formatMonthlySheetTitle", () => {
  it("formats month and year", () => {
    expect(formatMonthlySheetTitle(new Date("2025-03-15T12:00:00Z"))).toBe(
      "March 2025",
    );
  });

  it("uses the timezone at month boundaries", () => {
    const justAfterUtcMarch = new Date("2025-03-01T00:30:00Z");
    expect(formatMonthlySheetTitle(justAfterUtcMarch, "UTC")).toBe(
      "March 2025",
    );
    expect(
      formatMonthlySheetTitle(justAfterUtcMarch, "America/Los_Angeles"),
    ).toBe("February 2025");
  });
});
