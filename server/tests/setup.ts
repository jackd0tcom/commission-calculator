/**
 * API tests require a local Postgres database `commissions-db-test`.
 * `npm test` (unit) does not need Postgres.
 */
import { beforeEach } from "vitest";
import { db } from "../model.js";

beforeEach(async () => {
  await db.query(`
    TRUNCATE TABLE
      deliveries,
      order_items,
      orders,
      commission_sheets,
      user_product_commissions,
      clients,
      products,
      links,
      vendor_fields,
      vendors_products,
      vendors,
      users
    RESTART IDENTITY CASCADE
  `);
});
