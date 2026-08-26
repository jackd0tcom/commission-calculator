import { describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import { formatMonthlySheetTitle } from "../../commissionSheets.js";
import { Delivery } from "../../model.js";
import {
  asNumber,
  createClientForUser,
  createLink,
  createLinkItem,
  createOrder,
  createProduct,
  createProductItem,
  createUser,
  createUserRate,
  findItem,
  findOrder,
  findSheet,
  loginAs,
} from "../fixtures.js";

const app = createApp();

async function snapshotItem(itemId: number) {
  const item = await findItem(itemId);
  if (!item) throw new Error(`item ${itemId} not found`);
  const deliveries = (await Delivery.findAll({ where: { itemId } })) as any[];
  return { item, deliveries };
}

describe("order item status", () => {
  let sales: Awaited<ReturnType<typeof createUser>>;
  let agent: Awaited<ReturnType<typeof loginAs>>;

  async function seedProductOrder(itemCount = 1) {
    sales = await createUser();
    agent = await loginAs(app, {
      auth0Id: sales.auth0Id,
      email: sales.email,
      firstName: sales.firstName,
      lastName: sales.lastName,
    });
    const client = await createClientForUser(sales.userId);
    const product = await createProduct();
    const order = await createOrder({
      userId: sales.userId,
      clientId: client.clientId,
      salesPerson: sales.userId,
    });
    const items = [];
    for (let i = 0; i < itemCount; i += 1) {
      items.push(
        await createProductItem({
          orderId: order.orderId,
          productId: product.productId,
          price: 120,
          cost: 50,
        }),
      );
    }
    return { product, order, items };
  }

  it("completing an item hydrates snapshots, creates a delivery, and attaches the salesperson monthly sheet", async () => {
    const { product, order, items } = await seedProductOrder();
    const item = items[0];

    const res = await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
        price: 120,
        cost: 50,
      },
    });
    expect(res.status).toBe(200);

    const { item: updated, deliveries } = await snapshotItem(item.itemId);
    const title = formatMonthlySheetTitle(
      new Date(),
      process.env.COMMISSION_SHEET_TIMEZONE,
    );
    const sheet = await findSheet({
      userId: sales.userId,
      sheetTitle: title,
    });

    expect(sheet).not.toBeNull();
    expect(updated.itemStatus).toBe("complete");
    expect(updated.sheetId).toBe(sheet!.sheetId);
    expect(updated.productNameSnapshot).toBe(product.productName);
    expect(asNumber(updated.priceSnapshot)).toBe(120);
    expect(asNumber(updated.costSnapshot)).toBe(50);
    expect(asNumber(updated.defaultPriceSnapshot)).toBe(100);
    expect(asNumber(updated.defaultCostSnapshot)).toBe(40);
    expect(asNumber(updated.commissionRateSnapshot)).toBeCloseTo(0.5);
    expect(asNumber(updated.spiffSnapshot)).toBe(10);
    expect(deliveries).toHaveLength(1);
    expect(deliveries[0].sheetId).toBe(sheet!.sheetId);

    const parent = await findOrder(order.orderId);
    expect(parent!.orderStatus).toBe("delivered");
  });

  it("moving complete back to in progress destroys the delivery and clears sheetId but keeps snapshots", async () => {
    const { order, items } = await seedProductOrder();
    const item = items[0];

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });

    const res = await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "in progress",
      },
    });
    expect(res.status).toBe(200);

    const { item: updated, deliveries } = await snapshotItem(item.itemId);
    expect(updated.itemStatus).toBe("in progress");
    expect(updated.sheetId).toBeNull();
    expect(updated.productNameSnapshot).toBe("Guest Post");
    expect(asNumber(updated.priceSnapshot)).toBe(120);
    expect(asNumber(updated.costSnapshot)).toBe(50);
    expect(deliveries).toHaveLength(0);

    const parent = await findOrder(order.orderId);
    expect(parent!.orderStatus).toBe("in progress");
  });

  it("moving to staged or cancelled clears snapshots and deliveries", async () => {
    const { order, items } = await seedProductOrder();
    const item = items[0];

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });

    const staged = await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "staged",
      },
    });
    expect(staged.status).toBe(200);

    let snap = await snapshotItem(item.itemId);
    expect(snap.item.itemStatus).toBe("staged");
    expect(snap.item.sheetId).toBeNull();
    expect(snap.item.productNameSnapshot).toBeNull();
    expect(snap.item.priceSnapshot).toBeNull();
    expect(snap.item.commissionRateSnapshot).toBeNull();
    expect(snap.item.costSnapshot).toBeNull();
    expect(snap.deliveries).toHaveLength(0);

    const cancelled = await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "cancelled",
      },
    });
    expect(cancelled.status).toBe(200);
    snap = await snapshotItem(item.itemId);
    expect(snap.item.itemStatus).toBe("cancelled");
    expect(snap.item.productNameSnapshot).toBeNull();
    expect(snap.deliveries).toHaveLength(0);
  });

  it("moving to ordered hydrates snapshots without creating a delivery", async () => {
    const { product, order, items } = await seedProductOrder();
    const item = items[0];

    const res = await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "ordered",
      },
    });
    expect(res.status).toBe(200);

    const { item: updated, deliveries } = await snapshotItem(item.itemId);
    expect(updated.itemStatus).toBe("ordered");
    expect(updated.sheetId).toBeNull();
    expect(updated.productNameSnapshot).toBe(product.productName);
    expect(asNumber(updated.priceSnapshot)).toBe(120);
    expect(deliveries).toHaveLength(0);

    const parent = await findOrder(order.orderId);
    expect(parent!.orderStatus).toBe("in progress");
  });

  it("sets parent order status to partial then delivered as items complete", async () => {
    const { order, items } = await seedProductOrder(2);

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: items[0].itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });
    expect((await findOrder(order.orderId))!.orderStatus).toBe("partial");

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: items[1].itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });
    expect((await findOrder(order.orderId))!.orderStatus).toBe("delivered");
  });

  it("bulk complete matches single complete for snapshots, delivery, and monthly sheet", async () => {
    sales = await createUser();
    agent = await loginAs(app, {
      auth0Id: sales.auth0Id,
      email: sales.email,
      firstName: sales.firstName,
      lastName: sales.lastName,
    });
    const client = await createClientForUser(sales.userId);
    const product = await createProduct();
    const singleOrder = await createOrder({
      userId: sales.userId,
      clientId: client.clientId,
      salesPerson: sales.userId,
      orderTitle: "single",
    });
    const bulkOrder = await createOrder({
      userId: sales.userId,
      clientId: client.clientId,
      salesPerson: sales.userId,
      orderTitle: "bulk",
    });
    const singleItem = await createProductItem({
      orderId: singleOrder.orderId,
      productId: product.productId,
      price: 120,
      cost: 50,
    });
    const bulkItem = await createProductItem({
      orderId: bulkOrder.orderId,
      productId: product.productId,
      price: 120,
      cost: 50,
    });

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: singleItem.itemId,
        orderId: singleOrder.orderId,
        itemStatus: "complete",
        price: 120,
        cost: 50,
      },
    });
    const bulkRes = await agent.post("/api/bulkUpdateOrderStatus").send({
      itemStatus: "complete",
      items: [
        {
          itemId: bulkItem.itemId,
          orderId: bulkOrder.orderId,
          price: 120,
          cost: 50,
        },
      ],
    });
    expect(bulkRes.status).toBe(200);

    const singleSnap = await snapshotItem(singleItem.itemId);
    const bulkSnap = await snapshotItem(bulkItem.itemId);

    expect(singleSnap.item.sheetId).toBe(bulkSnap.item.sheetId);
    expect(singleSnap.item.productNameSnapshot).toBe(
      bulkSnap.item.productNameSnapshot,
    );
    expect(asNumber(singleSnap.item.priceSnapshot)).toBe(
      asNumber(bulkSnap.item.priceSnapshot),
    );
    expect(asNumber(singleSnap.item.costSnapshot)).toBe(
      asNumber(bulkSnap.item.costSnapshot),
    );
    expect(asNumber(singleSnap.item.commissionRateSnapshot)).toBeCloseTo(
      asNumber(bulkSnap.item.commissionRateSnapshot),
    );
    expect(singleSnap.deliveries).toHaveLength(1);
    expect(bulkSnap.deliveries).toHaveLength(1);
    expect((await findOrder(singleOrder.orderId))!.orderStatus).toBe(
      "delivered",
    );
    expect((await findOrder(bulkOrder.orderId))!.orderStatus).toBe(
      "delivered",
    );
  });

  it("snapshots a request-body commission rate and the product default otherwise", async () => {
    const { order, items, product } = await seedProductOrder();
    await createUserRate(sales.userId, product.productId, 0.25);

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: items[0].itemId,
        orderId: order.orderId,
        itemStatus: "complete",
        commissionRateSnapshot: 0.3,
      },
    });
    expect(
      asNumber((await findItem(items[0].itemId))!.commissionRateSnapshot),
    ).toBeCloseTo(0.3);

    const second = await createProductItem({
      orderId: order.orderId,
      productId: product.productId,
    });
    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: second.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });
    // Current lookup treats userRate as a scalar, so the product default is stored.
    expect(
      asNumber((await findItem(second.itemId))!.commissionRateSnapshot),
    ).toBeCloseTo(0.5);
  });

  it("snapshots the link commission rate for link items", async () => {
    sales = await createUser();
    agent = await loginAs(app, {
      auth0Id: sales.auth0Id,
      email: sales.email,
      firstName: sales.firstName,
      lastName: sales.lastName,
    });
    const client = await createClientForUser(sales.userId);
    const link = await createLink();
    const order = await createOrder({
      userId: sales.userId,
      clientId: client.clientId,
      salesPerson: sales.userId,
    });
    const item = await createLinkItem({
      orderId: order.orderId,
      linkId: link.linkId,
    });

    const res = await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });
    expect(res.status).toBe(200);

    const { item: updated, deliveries } = await snapshotItem(item.itemId);
    expect(updated.productNameSnapshot).toBe("Example Mag");
    expect(asNumber(updated.priceSnapshot)).toBe(80);
    expect(asNumber(updated.costSnapshot)).toBe(20);
    expect(asNumber(updated.commissionRateSnapshot)).toBeCloseTo(0.4);
    expect(deliveries).toHaveLength(1);
  });

  it("bulk complete of one of two items sets the parent order to partial", async () => {
    const { order, items } = await seedProductOrder(2);

    const res = await agent.post("/api/bulkUpdateOrderStatus").send({
      itemStatus: "complete",
      items: [{ itemId: items[0].itemId, orderId: order.orderId }],
    });
    expect(res.status).toBe(200);
    expect((await findOrder(order.orderId))!.orderStatus).toBe("partial");
    expect((await snapshotItem(items[0].itemId)).deliveries).toHaveLength(1);
    expect((await snapshotItem(items[1].itemId)).deliveries).toHaveLength(0);
  });
});
