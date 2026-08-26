import { describe, expect, it } from "vitest";
import {
  checkResponaPlacement,
  formatDollar,
  formatDollarNoCents,
  formatMoneyInput,
  getCommission,
  getCommissionAmount,
  getGP,
  getGPclass,
  parseNumericInput,
  sanitizeNumericInput,
} from "./helpers";

const product = {
  productId: 1,
  defaultPrice: 100,
  defaultCost: 40,
  commissionRate: 0.5,
  user_product_commissions: [{ userId: 7, commissionRate: 0.25 }],
};

describe("sanitizeNumericInput", () => {
  it("returns cleaned numeric strings", () => {
    expect(sanitizeNumericInput("12.5")).toBe("12.5");
    expect(sanitizeNumericInput("")).toBe("");
    expect(sanitizeNumericInput(".")).toBe(".");
  });

  it("strips leading zeros before a digit", () => {
    expect(sanitizeNumericInput("012")).toBe("12");
    expect(sanitizeNumericInput("00")).toBe("0");
    expect(sanitizeNumericInput("0.5")).toBe("0.5");
  });

  it("returns null for invalid characters", () => {
    expect(sanitizeNumericInput("abc")).toBeNull();
    expect(sanitizeNumericInput("12a")).toBeNull();
    expect(sanitizeNumericInput("1.2.3")).toBeNull();
    expect(sanitizeNumericInput("-1")).toBeNull();
  });
});

describe("parseNumericInput", () => {
  it("parses finite numbers", () => {
    expect(parseNumericInput("12.5")).toBe(12.5);
    expect(parseNumericInput("0")).toBe(0);
  });

  it("treats empty and bare decimal as 0", () => {
    expect(parseNumericInput("")).toBe(0);
    expect(parseNumericInput(".")).toBe(0);
  });

  it("returns 0 for non-finite values", () => {
    expect(parseNumericInput("foo")).toBe(0);
  });
});

describe("formatMoneyInput", () => {
  it("formats to two decimal places", () => {
    expect(formatMoneyInput(12.5)).toBe("12.50");
    expect(formatMoneyInput(0)).toBe("0.00");
  });

  it("returns 0.00 for non-finite numbers", () => {
    expect(formatMoneyInput(Number.NaN)).toBe("0.00");
    expect(formatMoneyInput(Number.POSITIVE_INFINITY)).toBe("0.00");
  });
});

describe("formatDollar / formatDollarNoCents", () => {
  it("formats USD with cents", () => {
    expect(formatDollar(1234.5)).toBe("$1,234.50");
  });

  it("formats USD without cents", () => {
    expect(formatDollarNoCents(70.4)).toBe("$70");
    expect(formatDollarNoCents(0)).toBe("$0");
  });
});

describe("getGPclass", () => {
  it("treats 0 as high-gp", () => {
    expect(getGPclass(0)).toBe("high-gp");
  });

  it("treats values under 40 as low-gp", () => {
    expect(getGPclass(39)).toBe("low-gp");
  });

  it("treats exactly 40 as high-gp (mid band is exclusive)", () => {
    expect(getGPclass(40)).toBe("high-gp");
  });

  it("treats the open (40, 60) band as mid-gp", () => {
    expect(getGPclass(41)).toBe("mid-gp");
    expect(getGPclass(59)).toBe("mid-gp");
  });

  it("treats 60 and above as high-gp", () => {
    expect(getGPclass(60)).toBe("high-gp");
  });
});

describe("getGP", () => {
  it("uses delivery count as quantity and snapshot fallbacks", () => {
    const item = {
      productId: 1,
      priceSnapshot: 120,
      costSnapshot: 50,
      deliveries: [{}, {}],
    };
    // (120 - 50) * 2
    expect(getGP(item, [product])).toBe(140);
  });

  it("falls back through price then product defaultPrice", () => {
    const item = {
      productId: 1,
      price: 90,
      deliveries: [{}],
    };
    // price 90, cost product.defaultCost 40
    expect(getGP(item, [product])).toBe(50);
  });

  it("uses link price/cost when there is no matching product", () => {
    const item = {
      productId: 99,
      link: { defaultPrice: 80, cost: 20 },
      deliveries: [{}],
    };
    expect(getGP(item, [product])).toBe(60);
  });

  it("returns 0 when there are no deliveries", () => {
    const item = { productId: 1, priceSnapshot: 100, costSnapshot: 40 };
    expect(getGP(item, [product])).toBe(0);
  });
});

describe("getCommission", () => {
  it("uses the user-specific rate when present", () => {
    const item = {
      productId: 1,
      priceSnapshot: 100,
      costSnapshot: 40,
      deliveries: [{}, {}],
    };
    // contribution 120 * 0.25
    expect(getCommission(item, [product], 7)).toBe(30);
  });

  it("prefers commissionRateSnapshot over the user-specific rate", () => {
    const item = {
      productId: 1,
      priceSnapshot: 100,
      costSnapshot: 40,
      commissionRateSnapshot: 0.1,
      deliveries: [{}, {}],
    };
    expect(getCommission(item, [product], 7)).toBe(12);
  });

  it("falls back to the product rate when the user has no override", () => {
    const item = {
      productId: 1,
      priceSnapshot: 100,
      costSnapshot: 40,
      deliveries: [{}, {}],
    };
    expect(getCommission(item, [product], 99)).toBe(60);
  });

  it("uses the link rate for link items without a user override", () => {
    const item = {
      productId: null,
      link: { defaultPrice: 80, cost: 20, commissionRate: 0.4 },
      deliveries: [{}],
    };
    expect(getCommission(item, [product], 7)).toBe(24);
  });

  it("returns 0 when contribution is not positive", () => {
    const item = {
      productId: 1,
      priceSnapshot: 10,
      costSnapshot: 50,
      deliveries: [{}],
    };
    expect(getCommission(item, [product], 99)).toBe(0);
  });
});

describe("getCommissionAmount", () => {
  it("returns $0 for a missing or empty sheet", () => {
    expect(getCommissionAmount(null)).toBe("$0");
    expect(getCommissionAmount({})).toBe("$0");
    expect(getCommissionAmount({ commission_items: [] })).toBe("$0");
  });

  it("skips items without a product and uses price/cost overrides", () => {
    const amount = getCommissionAmount({
      commission_items: [
        { quantity: 2 },
        {
          quantity: 2,
          price: 120,
          cost: 50,
          product: { defaultPrice: 100, defaultCost: 40, commissionRate: 0.5 },
        },
      ],
    });
    // (120 - 50) * 2 * 0.5 = 70
    expect(amount).toBe("$70");
  });

  it("falls back to product defaults and quantity", () => {
    const amount = getCommissionAmount({
      commission_items: [
        {
          quantity: 3,
          product: { defaultPrice: 100, defaultCost: 40, commissionRate: 0.5 },
        },
      ],
    });
    // (100 - 40) * 3 * 0.5 = 90
    expect(amount).toBe("$90");
  });
});

describe("checkResponaPlacement", () => {
  it("passes when url, anchor, and quality tier are present", () => {
    expect(
      checkResponaPlacement({
        targetUrl: "https://example.com",
        anchorText: "Example",
        vendorPayload: { qualityTier: "DR_40" },
      }),
    ).toEqual({ pass: true });
  });

  it("reports a missing target URL first", () => {
    expect(
      checkResponaPlacement({
        targetUrl: "",
        anchorText: "Example",
        vendorPayload: { qualityTier: "DR_40" },
      }),
    ).toEqual({ pass: false, error: "No Target URL Found" });
  });

  it("reports missing anchor text when the URL is present", () => {
    expect(
      checkResponaPlacement({
        targetUrl: "https://example.com",
        anchorText: "",
        vendorPayload: { qualityTier: "DR_40" },
      }),
    ).toEqual({ pass: false, error: "No Anchor Text Found" });
  });

  it("reports a missing quality tier last", () => {
    expect(
      checkResponaPlacement({
        targetUrl: "https://example.com",
        anchorText: "Example",
        vendorPayload: {},
      }),
    ).toEqual({ pass: false, error: "No Link Tier Found" });
  });
});
