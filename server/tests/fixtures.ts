import type { Express } from "express";
import request from "supertest";
import {
  Client,
  CommissionSheet,
  Link,
  Order,
  OrderItem,
  Product,
  User,
  UserProductCommission,
} from "../model.js";

export function asNumber(value: unknown) {
  return Number(value);
}

export async function createUser(
  overrides: Record<string, unknown> = {},
): Promise<any> {
  return User.create({
    auth0Id: "auth0|sales",
    email: "sales@example.com",
    firstName: "Sales",
    lastName: "Person",
    isAdmin: false,
    isAllowed: true,
    isSales: true,
    ...overrides,
  });
}

export async function createAdminUser() {
  return createUser({
    auth0Id: "auth0|admin",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    isAdmin: true,
    isAllowed: true,
    isSales: false,
  });
}

export async function createClientForUser(
  userId: number,
  clientName = "Acme Co",
): Promise<any> {
  return Client.create({ userId, clientName });
}

export async function createProduct(
  overrides: Record<string, unknown> = {},
): Promise<any> {
  return Product.create({
    productName: "Guest Post",
    defaultPrice: 100,
    defaultCost: 40,
    commissionRate: 0.5,
    spiff: 10,
    ...overrides,
  });
}

export async function createLink(
  overrides: Record<string, unknown> = {},
): Promise<any> {
  return Link.create({
    publication: "Example Mag",
    url: "https://example.com",
    defaultPrice: 80,
    cost: 20,
    commissionRate: 0.4,
    spiff: 5,
    ...overrides,
  });
}

export async function createOrder(params: {
  userId: number;
  clientId: number;
  salesPerson: number;
  orderTitle?: string;
}): Promise<any> {
  return Order.create({
    userId: params.userId,
    clientId: params.clientId,
    salesPerson: params.salesPerson,
    orderTitle: params.orderTitle ?? "Test order",
    orderStatus: "in progress",
  });
}

export async function createProductItem(params: {
  orderId: number;
  productId: number;
  price?: number;
  cost?: number;
  itemStatus?: string;
}): Promise<any> {
  return OrderItem.create({
    orderId: params.orderId,
    productId: params.productId,
    productType: "product",
    itemStatus: params.itemStatus ?? "staged",
    price: params.price ?? 100,
    cost: params.cost ?? 40,
    orderIndex: 1,
  });
}

export async function createLinkItem(params: {
  orderId: number;
  linkId: number;
  price?: number;
  cost?: number;
}): Promise<any> {
  return OrderItem.create({
    orderId: params.orderId,
    linkId: params.linkId,
    productType: "link",
    itemStatus: "staged",
    price: params.price ?? 80,
    cost: params.cost ?? 20,
    orderIndex: 1,
  });
}

export async function createUserRate(
  userId: number,
  productId: number,
  commissionRate: number,
): Promise<any> {
  return UserProductCommission.create({
    userId,
    productId,
    commissionRate,
  });
}

export async function createSheet(
  overrides: Record<string, unknown> = {},
): Promise<any> {
  return CommissionSheet.create(overrides);
}

export async function findSheet(where: Record<string, unknown>): Promise<any> {
  return CommissionSheet.findOne({ where });
}

export async function findSheets(
  where: Record<string, unknown>,
): Promise<any[]> {
  return CommissionSheet.findAll({ where });
}

export async function findOrder(orderId: number): Promise<any> {
  return Order.findByPk(orderId);
}

export async function findItem(itemId: number): Promise<any> {
  return OrderItem.findByPk(itemId);
}

export async function loginAs(
  app: Express,
  user: {
    auth0Id: string;
    email: string;
    firstName: string;
    lastName: string;
  },
) {
  const agent = request.agent(app);
  const res = await agent.post("/api/sync-auth0-user").send({
    auth0Id: user.auth0Id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`,
    picture: "",
  });
  if (res.status !== 200) {
    throw new Error(`login failed: ${res.status} ${res.text}`);
  }
  return agent;
}
