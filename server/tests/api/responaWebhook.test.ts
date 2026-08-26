import { createHmac } from "crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { createApp } from "../../app.js";
import {
  asNumber,
  createClientForUser,
  createOrder,
  createProduct,
  createProductItem,
  createUser,
  findItem,
  findOrder,
} from "../fixtures.js";

vi.mock("../../integrations/responaClient.js", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../integrations/responaClient.js")>();
  return {
    ...actual,
    getPlacement: vi.fn(),
    getOrder: vi.fn(),
  };
});

import { getOrder, getPlacement } from "../../integrations/responaClient.js";

const app = createApp();
const secret = "test-webhook-secret";

function sign(rawBody: string, timestamp = Math.floor(Date.now() / 1000)) {
  const v1 = createHmac("sha256", secret)
    .update(`${timestamp}.`)
    .update(rawBody)
    .digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

async function seedResponaOrder() {
  const sales = await createUser();
  const client = await createClientForUser(sales.userId);
  const product = await createProduct();
  const order = await createOrder({
    userId: sales.userId,
    clientId: client.clientId,
    salesPerson: sales.userId,
  });
  await order.update({
    responaOrderId: 9001,
    responaOrderStatus: "LAUNCHED",
    responaAmount: 0,
  });
  const item = await createProductItem({
    orderId: order.orderId,
    productId: product.productId,
  });
  await item.update({
    responaItemId: 8001,
    responaItemStatus: "ORDERED",
  });
  return { order, item };
}

describe("Respona webhook", () => {
  beforeEach(() => {
    vi.mocked(getPlacement).mockReset();
    vi.mocked(getOrder).mockReset();
    process.env.RESPONA_WEBHOOK_SECRET = secret;
  });

  it("rejects requests without a valid signature", async () => {
    const body = JSON.stringify({
      event: "order.status_changed",
      data: { order_id: "9001", status: "COMPLETED" },
    });

    const unsigned = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .send(body);
    expect(unsigned.status).toBe(401);

    const badSig = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .set("x-respona-signature", "t=1,v1=nope")
      .send(body);
    expect(badSig.status).toBe(401);
  });

  it("rejects when the webhook secret is missing", async () => {
    delete process.env.RESPONA_WEBHOOK_SECRET;
    const body = JSON.stringify({
      event: "order.status_changed",
      data: { order_id: "9001", status: "COMPLETED" },
    });
    const res = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .set("x-respona-signature", sign(body))
      .send(body);
    expect(res.status).toBe(401);
  });

  it("updates a placement from placement.status_changed", async () => {
    const { item } = await seedResponaOrder();
    vi.mocked(getPlacement).mockResolvedValue({
      placement_id: "8001",
      status: "LIVE",
      requested_url: "https://example.com",
      requested_anchor: "Example",
      publisher_url: "https://publisher.example/post",
      quality_tier: "DR_40",
      price: 12345,
      rejected_count: 0,
      rejection_limit: 0,
      price_breakdown: [],
    });

    const body = JSON.stringify({
      event: "placement.status_changed",
      data: {
        order_id: "9001",
        placement_id: "8001",
        status: "LIVE",
      },
    });

    const res = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .set("x-respona-signature", sign(body))
      .send(body);
    expect(res.status).toBe(200);

    const updated = await findItem(item.itemId);
    expect(updated!.responaItemStatus).toBe("LIVE");
    expect(updated!.responaPublishedUrl).toBe(
      "https://publisher.example/post",
    );
    expect(asNumber(updated!.cost)).toBeCloseTo(123.45);
    expect(getPlacement).toHaveBeenCalledWith("9001", "8001");
  });

  it("updates an order from order.status_changed", async () => {
    const { order } = await seedResponaOrder();
    vi.mocked(getOrder).mockResolvedValue({
      order_id: "9001",
      title: "Respona order",
      status: "COMPLETED",
      placements: [],
      price: 99.5,
      price_breakdown: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const body = JSON.stringify({
      event: "order.status_changed",
      data: {
        order_id: "9001",
        status: "COMPLETED",
      },
    });

    const res = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .set("x-respona-signature", sign(body))
      .send(body);
    expect(res.status).toBe(200);

    const updated = await findOrder(order.orderId);
    expect(updated!.responaOrderStatus).toBe("COMPLETED");
    expect(asNumber(updated!.responaAmount)).toBeCloseTo(99.5);
  });

  it("acks unknown events and missing local rows with 200", async () => {
    const unknownBody = JSON.stringify({
      event: "something.else",
      data: { order_id: "1" },
    });
    const unknown = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .set("x-respona-signature", sign(unknownBody))
      .send(unknownBody);
    expect(unknown.status).toBe(200);

    const missingPlacement = JSON.stringify({
      event: "placement.status_changed",
      data: {
        order_id: "9001",
        placement_id: "404",
        status: "LIVE",
      },
    });
    const missing = await request(app)
      .post("/api/respona/webhook")
      .set("Content-Type", "application/json")
      .set("x-respona-signature", sign(missingPlacement))
      .send(missingPlacement);
    expect(missing.status).toBe(200);
    expect(getPlacement).not.toHaveBeenCalled();
  });
});
