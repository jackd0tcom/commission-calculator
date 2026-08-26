import { describe, expect, it } from "vitest";
import { createApp } from "../../app.js";
import {
  ensureMonthlySheetsForAllowedUsers,
  formatMonthlySheetTitle,
} from "../../commissionSheets.js";
import { Delivery } from "../../model.js";
import {
  createAdminUser,
  createClientForUser,
  createOrder,
  createProduct,
  createProductItem,
  createSheet,
  createUser,
  findSheet,
  findSheets,
  loginAs,
} from "../fixtures.js";

const app = createApp();

describe("commission sheets", () => {
  it("sets sheetStatus and submitDate when submitted", async () => {
    const sales = await createUser();
    const agent = await loginAs(app, {
      auth0Id: sales.auth0Id,
      email: sales.email,
      firstName: sales.firstName,
      lastName: sales.lastName,
    });
    const sheet = await createSheet({
      userId: sales.userId,
      sheetTitle: "March 2025",
      sheetStatus: "draft",
    });

    const before = Date.now();
    const res = await agent.post("/api/updateSheet").send({
      sheetId: sheet.sheetId,
      fieldName: "sheetStatus",
      value: "submitted",
    });
    expect(res.status).toBe(200);

    const updated = await findSheet({ sheetId: sheet.sheetId });
    expect(updated!.sheetStatus).toBe("submitted");
    expect(updated!.submitDate).not.toBeNull();
    expect(new Date(updated!.submitDate).getTime()).toBeGreaterThanOrEqual(
      before - 1000,
    );
  });

  it("lets the owner load a sheet and 401s a non-owner non-admin", async () => {
    const owner = await createUser();
    const other = await createUser({
      auth0Id: "auth0|other",
      email: "other@example.com",
      firstName: "Other",
      lastName: "User",
    });
    const ownerAgent = await loginAs(app, {
      auth0Id: owner.auth0Id,
      email: owner.email,
      firstName: owner.firstName,
      lastName: owner.lastName,
    });
    const otherAgent = await loginAs(app, {
      auth0Id: other.auth0Id,
      email: other.email,
      firstName: other.firstName,
      lastName: other.lastName,
    });

    const client = await createClientForUser(owner.userId);
    const product = await createProduct();
    const order = await createOrder({
      userId: owner.userId,
      clientId: client.clientId,
      salesPerson: owner.userId,
    });
    const item = await createProductItem({
      orderId: order.orderId,
      productId: product.productId,
    });

    await ownerAgent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });

    const title = formatMonthlySheetTitle(
      new Date(),
      process.env.COMMISSION_SHEET_TIMEZONE,
    );
    const sheet = await findSheet({
      userId: owner.userId,
      sheetTitle: title,
    });
    expect(sheet).not.toBeNull();

    const ownerRes = await ownerAgent.get(`/api/getSheet/${sheet!.sheetId}`);
    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.orders).toHaveLength(1);
    expect(ownerRes.body.orders[0].order_items).toHaveLength(1);
    expect(ownerRes.body.orders[0].order_items[0].deliveries.length).toBeGreaterThan(
      0,
    );

    const denied = await otherAgent.get(`/api/getSheet/${sheet!.sheetId}`);
    expect(denied.status).toBe(401);
  });

  it("lets an admin list pending sheets", async () => {
    const sales = await createUser();
    const admin = await createAdminUser();
    const adminAgent = await loginAs(app, {
      auth0Id: admin.auth0Id,
      email: admin.email,
      firstName: admin.firstName,
      lastName: admin.lastName,
    });

    await createSheet({
      userId: sales.userId,
      sheetTitle: "Pending Sheet",
      sheetStatus: "submitted",
      submitDate: new Date(),
    });

    const res = await adminAgent.post("/api/getPendingSheets").send({
      status: "submitted",
    });
    expect(res.status).toBe(200);
    expect(res.body.some((s: { sheetTitle: string }) => s.sheetTitle === "Pending Sheet")).toBe(
      true,
    );
  });

  it("only lets the owner delete a sheet", async () => {
    const owner = await createUser();
    const other = await createUser({
      auth0Id: "auth0|intruder",
      email: "intruder@example.com",
      firstName: "Intruder",
      lastName: "User",
    });
    const ownerAgent = await loginAs(app, {
      auth0Id: owner.auth0Id,
      email: owner.email,
      firstName: owner.firstName,
      lastName: owner.lastName,
    });
    const otherAgent = await loginAs(app, {
      auth0Id: other.auth0Id,
      email: other.email,
      firstName: other.firstName,
      lastName: other.lastName,
    });
    const sheet = await createSheet({
      userId: owner.userId,
      sheetTitle: "Delete me",
    });

    const denied = await otherAgent.post("/api/deleteSheet").send({
      sheetId: sheet.sheetId,
    });
    expect(denied.status).toBe(401);
    expect(await findSheet({ sheetId: sheet.sheetId })).not.toBeNull();

    const deleted = await ownerAgent.post("/api/deleteSheet").send({
      sheetId: sheet.sheetId,
    });
    expect(deleted.status).toBe(200);
    expect(await findSheet({ sheetId: sheet.sheetId })).toBeNull();
  });

  it("omits completed items from getSheet when they have no delivery", async () => {
    const sales = await createUser();
    const agent = await loginAs(app, {
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
    const item = await createProductItem({
      orderId: order.orderId,
      productId: product.productId,
    });

    await agent.post("/api/updateOrderStatus").send({
      item: {
        itemId: item.itemId,
        orderId: order.orderId,
        itemStatus: "complete",
      },
    });

    const title = formatMonthlySheetTitle(
      new Date(),
      process.env.COMMISSION_SHEET_TIMEZONE,
    );
    const sheet = await findSheet({
      userId: sales.userId,
      sheetTitle: title,
    });

    await Delivery.destroy({ where: { itemId: item.itemId } });

    const res = await agent.get(`/api/getSheet/${sheet!.sheetId}`);
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0);
  });

  it("creates monthly sheets for allowed users and is idempotent", async () => {
    const allowed = await createUser();
    await createUser({
      auth0Id: "auth0|blocked",
      email: "blocked@example.com",
      firstName: "Blocked",
      lastName: "User",
      isAllowed: false,
    });

    const now = new Date("2025-06-15T12:00:00Z");
    await ensureMonthlySheetsForAllowedUsers(now);
    await ensureMonthlySheetsForAllowedUsers(now);

    const title = formatMonthlySheetTitle(now, process.env.COMMISSION_SHEET_TIMEZONE);
    const sheets = await findSheets({ sheetTitle: title });
    expect(sheets).toHaveLength(1);
    expect(sheets[0].userId).toBe(allowed.userId);
  });
});
