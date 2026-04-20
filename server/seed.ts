import { configDotenv } from "dotenv";
import {
  db,
  User,
  Client,
  Product,
  CommissionSheet,
  Order,
  OrderItem,
  Link,
  Vendor,
  VendorField,
  Delivery,
} from "./model.js";

configDotenv();

type VendorRow = { vendorId: number };
type SheetRow = { sheetId: number };
type ClientRow = { clientId: number };
type OrderRow = { orderId: number };
type ProductRow = {
  productId: number;
  productName: string | null;
  defaultPrice: number;
  commissionRate: number;
  spiff: number | null;
  cost: number;
};
type OrderItemRow = { itemId: number };

async function seed() {
  await db.sync({ force: true });

  // Create userId 1 so FKs (clients, commission_sheets) are satisfied.
  // Set SEED_AUTH0_ID to your Auth0 sub so this user is "you" when you log in.
  const seedAuth0Id = process.env.SEED_AUTH0_ID || "auth0|seed-placeholder";
  await User.bulkCreate([
    {
      auth0Id: seedAuth0Id,
      email: "seed@example.com",
      profilePic:
        "https://lh3.googleusercontent.com/a-/ALV-UjVE3JERQ4KBvqT-ivZQKFsT1Vh5Ye6VCAsZT7D0Pyv9F1Se_OsRNiV1Y1qbyVJGhz8fvH1z1yP8_-uk1THKi0xjPtLAb_TAUnJKt0lsQ1ku_jU1MGfV9LcnkHObwYSroP_WumEmOosoVg5E0OH_T-nu1b0PfdP66bYKci-ra0FlQV0pSXJ1sLMQwk-O2LGVBl5OU-pJCHId4tzHFNQbYTtt6w5LG8dNYvnOGFcbCtLz1GnUGXwzb_SH3XiL8QUvX4tgSIV4paHQUyrlO6JJTpmR7UoNwH0gdHpV22jV6zne0eB3RdCNsR4nOsMeUcEezYvcse9SAF4vQmoqV4D2XyT9bMt2zNxrvTubQBtQUK6TFmWWO7ARdx1N5W5Jv8896pdBy3xowM2Dqw8aGvM6Xyu1UrNomnT0VMQbGGg2yUpgwQZINIb9rif8czxoCuCLLD_W6dtBPiWxtGScjoBZIhjcAS_dNCNZHe0vC_dHK3nCm_mq4liV_lEGFSZNYK9d-JOZ3VvVBMzpmvGW20LwBVmiuRa9DakrqiMv1bEMVT8FzYkWPe0ojLt86y9TNGT6qfnn7T1nmuXatP9q3a8BEYUaDAb2FU0WSMtC2xPoDWavc4Q_6om9LBWGhoCVbk8r735dlaHURepMYoSgOhfAAdegVrX-mU1wctAWa7T590W23bq4pOpmRqgq0DD8iVe27FFEZPDeXsWfk4nu1i8DDF0PdvguId0xEJ5eEIaD8M_z9V2PiIFPUPYQcVdQUyEDVmrWYKYMVBDxkfmIJJ87WYedMpbL2NISCAdqnXXp_2k0dQY2S6EWr8P_Gkj0l0iRayBv044r-j38vpMF9lokZm7gHZuLjv9tztNtN79X_TgfgiXjAL4rxZWrhgoRnjYiBEXg8OnXoILlnQx16jE-J3xlFxI_BDFhffwnOCloS9mg09oa3wyv4eMBvmO8mG0TOKmVtjAD91CrCDRyEVAYTq51v19_IeuD8spJOe9cUZmwBc8tBQyQ1TVC2KRB2q0jFXJ7ordLtkKOmruS0cgaqvXAnTTUu2LCG5GgYUtjyjCP2jdfD1U1hGwJ=s96-c",
      firstName: "Seed",
      lastName: "User",
      isAdmin: true,
      isAllowed: true,
    },
    {
      auth0Id: seedAuth0Id,
      email: "seed@example.com",
      firstName: "Melissa",
      lastName: "User",
      profilePic:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR7AfL0AT7VA3Dvbicibyh5yE0KwiTPWt5tvJZJliLb5gO52uqvdnduRzVj8X4Q1B7KvsNLAykwFN9PYSp28zMwBktbHYHGc_o_jDyv6MTCA&s=10",
      isAdmin: false,
      isAllowed: true,
    },
    {
      auth0Id: seedAuth0Id,
      email: "seed@example.com",
      firstName: "Hannah",
      lastName: "User",
      profilePic:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkybNQmhbfll_Q1RqY6sEr3YGQGWx-QE_gCPPRuvCOSyklES8qyx6YxF4JHyF-bXOKtdGzEDKL-CUc7wviP0YNFgMoKFKajnSeXWV4UF0f&s=10",
      isAdmin: false,
      isAllowed: true,
    },
    {
      auth0Id: seedAuth0Id,
      email: "seed@example.com",
      firstName: "Henry",
      lastName: "User",
      profilePic:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjknHTzcyYyJVR9UwMlDK4qsxtw2uJvh2UJEi8lIqpwDXfNwP43Q3fPyRlPkWArf1_200hJmUxUjuwlrJtSS5bpVsWfXCHca1wRzMoycUF&s=10",
      isAdmin: false,
      isAllowed: true,
    },
  ]);

  const clients = await Client.bulkCreate([
    { clientName: "Acme Corp", userId: 1, isArchived: false },
    { clientName: "Globex Industries", userId: 1, isArchived: false },
    { clientName: "Initech", userId: 1, isArchived: false },
    { clientName: "Umbrella Corp", userId: 1, isArchived: false },
    { clientName: "Stark Industries", userId: 1, isArchived: false },
    { clientName: "Wayne Enterprises", userId: 1, isArchived: false },
    { clientName: "Cyberdyne Systems", userId: 1, isArchived: false },
    { clientName: "Wonka Industries", userId: 1, isArchived: false },
    { clientName: "Dunder Mifflin", userId: 1, isArchived: false },
    { clientName: "Pied Piper", userId: 1, isArchived: false },
  ]);

  const products = await Product.bulkCreate([
    {
      productName: "Editorial Links",
      cost: 250,
      defaultPrice: 600,
      commissionRate: 0.05,
    },
    {
      productName: "Expert Links",
      cost: 1400,
      defaultPrice: 5000,
      commissionRate: 0.05,
    },
    {
      productName: "DPR",
      cost: 6700,
      defaultPrice: 15000,
      commissionRate: 0.05,
    },
    {
      productName: "News Links",
      cost: 500,
      defaultPrice: 900,
      commissionRate: 0.05,
    },
    {
      productName: "Foundation",
      cost: 400,
      defaultPrice: 1200,
      commissionRate: 0.05,
    },
    {
      productName: "Hourly LB",
      cost: 30,
      defaultPrice: 100,
      commissionRate: 0.05,
    },
    {
      productName: "News Syndications",
      cost: 75,
      defaultPrice: 125,
      commissionRate: 0.05,
    },
    {
      productName: "Media Blitz",
      cost: 2200,
      defaultPrice: 7500,
      commissionRate: 0.05,
    },
    {
      productName: "Linkable Content",
      cost: 150,
      defaultPrice: 700,
      commissionRate: 0.05,
    },
    {
      productName: "Keyword Content",
      cost: 150,
      defaultPrice: 700,
      commissionRate: 0.05,
    },
    {
      productName: "Content Roadmap",
      cost: 150,
      defaultPrice: 1500,
      commissionRate: 0.05,
    },
    {
      productName: "Strategic Revision",
      cost: 1500,
      defaultPrice: 800,
      commissionRate: 0.05,
    },
    {
      productName: "Content Audit",
      cost: 300,
      defaultPrice: 1200,
      commissionRate: 0.05,
    },
    {
      productName: "Advanced Content",
      cost: 300,
      defaultPrice: 1200,
      commissionRate: 0.05,
    },
    {
      productName: "Website Audit",
      cost: 500,
      defaultPrice: 2500,
      commissionRate: 0.05,
    },
    {
      productName: "Schema",
      cost: 60,
      defaultPrice: 300,
      commissionRate: 0.05,
    },
    {
      productName: "On Page Optimization",
      cost: 50,
      defaultPrice: 150,
      commissionRate: 0.05,
    },
    {
      productName: "Internal Link Optimization",
      cost: 300,
      defaultPrice: 2000,
      commissionRate: 0.05,
    },
    {
      productName: "AIO",
      cost: 1000,
      defaultPrice: 9000,
      commissionRate: 0.05,
    },
  ]);

  const links = await Link.bulkCreate([
    {
      linkName: "Editorial Links",
      url: "https://editorial-links.example",
      cost: 250,
      defaultPrice: 600,
      commissionRate: 0.05,
    },
    {
      linkName: "Expert Links",
      url: "https://expert-links.example",
      cost: 1400,
      defaultPrice: 5000,
      commissionRate: 0.05,
    },
    {
      linkName: "DPR",
      url: "https://dpr.example",
      cost: 6700,
      defaultPrice: 15000,
      commissionRate: 0.05,
    },
  ]);

  const vendors = await Vendor.bulkCreate([
    {
      vendorName: "Interior",
      googleSheetId: null,
    },
    {
      vendorName: "Next Net",
      googleSheetId: "1BxSeEdSeEd-demo-sheet-primary",
    },
    {
      vendorName: "Vissoula",
      googleSheetId: null,
    },
  ]);

  await VendorField.bulkCreate([
    {
      vendorId: 2,
      label: "P1P Team",
      fieldType: "string",
      required: true,
      sortIndex: 1,
      defaultValue: null,
      googleSheetId: "B",
    },
    {
      vendorId: 2,
      label: "Client ID",
      fieldType: "number",
      required: true,
      sortIndex: 2,
      defaultValue: null,
      googleSheetId: "C",
    },
    {
      vendorId: 2,
      label: "Client",
      fieldType: "string",
      required: true,
      sortIndex: 3,
      defaultValue: null,
      googleSheetId: "D",
    },
    {
      vendorId: 2,
      label: "Target Pages",
      fieldType: "string",
      required: false,
      sortIndex: 5,
      defaultValue: null,
      googleSheetId: "F",
    },
    {
      vendorId: 2,
      label: "Target Page Chosen",
      fieldType: "string",
      required: false,
      sortIndex: 6,
      defaultValue: null,
      googleSheetId: "G",
    },
    {
      vendorId: 2,
      label: "P1P Suggested Anchor Text",
      fieldType: "string",
      required: false,
      sortIndex: 7,
      defaultValue: null,
      googleSheetId: "H",
    },
    {
      vendorId: 3,
      label: "Campaign code",
      fieldType: "string",
      required: false,
      sortIndex: 0,
      defaultValue: null,
      googleSheetId: "C",
    },
  ]);

  const sheets = await CommissionSheet.bulkCreate([
    {
      userId: 1,
      sheetTitle: "January 2025 Commissions",
      sheetDescription: "Q1 kickoff sales",
      sheetStatus: "submitted",
    },
    {
      userId: 1,
      sheetTitle: "February 2025 Draft",
      sheetDescription: null,
      sheetStatus: "draft",
    },
    {
      userId: 1,
      sheetTitle: "December 2024 Commissions",
      sheetDescription: "Year-end",
      sheetStatus: "approved",
    },
  ]);

  const firstSheetId = (sheets[0]!.toJSON() as SheetRow).sheetId;

  const c = clients.map((row) => row.toJSON() as ClientRow);

  const ordersRaw = await Order.bulkCreate([
    {
      userId: 1,
      clientId: c[0]!.clientId,
      orderStatus: "in progress",
      salesPerson: 1,
    },
    {
      userId: 1,
      clientId: c[1]!.clientId,
      orderStatus: "in progress",
      salesPerson: 1,
    },
    {
      userId: 1,
      clientId: c[2]!.clientId,
      orderStatus: "delivered",
      salesPerson: 1,
    },
  ]);

  const orders = ordersRaw.map((row) => row.toJSON() as OrderRow);

  const p = products.map((row) => row.toJSON() as ProductRow);

  const orderItemsRaw = await OrderItem.bulkCreate([
    {
      orderId: orders[0]!.orderId,
      productId: p[0]!.productId,
      productType: "product",
      itemStatus: "complete",
      vendorId: vendors[0]!.vendorId,
      vendorPayload: { poNumber: "PO-ACM-1001", rushOrder: false },
      sheetId: firstSheetId,
      price: 600,
      anchorText: "best project management tools",
      linkingFrom: "https://acme.example/resources",
      linkingTo: "https://publisher.example/acme-story",
      deliveredAnchorText: "best project management tools",
      dateReported: "2025-01-15",
      da: 52,
      dr: 48,
      tf: 18,
      cf: 28,
      traffic: 12000,
      managerApproved: true,
    },
    {
      orderId: orders[0]!.orderId,
      productId: p[3]!.productId,
      productType: "product",
      itemStatus: "complete",
      vendorId: vendors[0]!.vendorId,
      vendorPayload: { poNumber: "PO-ACM-1002", rushOrder: true },
      sheetId: firstSheetId,
      price: 900,
    },
    {
      orderId: orders[1]!.orderId,
      productId: p[1]!.productId,
      productType: "product",
      itemStatus: "complete",
      vendorId: vendors[1]!.vendorId,
      vendorPayload: { campaignCode: "GLOBEX-Q1" },
      sheetId: firstSheetId,
      price: 5000,
    },
    {
      orderId: orders[2]!.orderId,
      productId: p[8]!.productId,
      productType: "product",
      itemStatus: "complete",
      vendorId: vendors[1]!.vendorId,
      vendorPayload: { campaignCode: "INITECH-LC" },
      sheetId: firstSheetId,
      price: 700,
      productNameSnapshot: p[8]!.productName,
      defaultPriceSnapshot: p[8]!.defaultPrice,
      commissionRateSnapshot: p[8]!.commissionRate,
      spiffSnapshot: p[8]!.spiff,
      costSnapshot: p[8]!.cost,
      priceSnapshot: 700,
    },
    {
      orderId: orders[0]!.orderId,
      productId: p[4]!.productId,
      productType: "product",
      itemStatus: "draft",
      vendorId: null,
      vendorPayload: null,
      sheetId: null,
      price: p[4]!.defaultPrice,
    },
  ]);

  const orderItems = orderItemsRaw.map((row) => row.toJSON() as OrderItemRow);

  const deliveries: Array<{
    itemId: number;
    sheetId: number;
    deliveredQuantity: number;
  }> = [];
  const addDeliveries = (itemId: number, count: number, sheetId: number) => {
    for (let i = 0; i < count; i += 1) {
      deliveries.push({
        itemId,
        sheetId,
        deliveredQuantity: 1,
      });
    }
  };

  addDeliveries(orderItems[0]!.itemId, 2, firstSheetId);
  addDeliveries(orderItems[1]!.itemId, 5, firstSheetId);
  addDeliveries(orderItems[2]!.itemId, 1, firstSheetId);
  addDeliveries(orderItems[3]!.itemId, 3, firstSheetId);

  await Delivery.bulkCreate(deliveries);

  console.log(
    [
      "Seed complete:",
      "1 user",
      `${clients.length} clients`,
      `${products.length} products`,
      `${links.length} links`,
      `${vendors.length} vendors`,
      "3 vendor field defs",
      `${sheets.length} commission sheets`,
      `${orders.length} orders`,
      `${orderItems.length} order items`,
      `${deliveries.length} deliveries`,
    ].join(", "),
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
