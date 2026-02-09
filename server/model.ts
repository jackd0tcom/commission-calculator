import { DataTypes, Model } from "sequelize";
import connectToDb from "./db.js";

const db = await connectToDb(
  process.env.DATABASE_URL || "postgresql:///commission-db",
);

export class CommissionSheet extends Model {}
CommissionSheet.init(
  {
    sheetId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sheetTitle: { type: DataTypes.STRING, allowNull: false },
    sheetDescription: { type: DataTypes.TEXT, allowNull: true },
    sheetStatus: {
      type: DataTypes.ENUM("draft", "submitted", "archived"),
      allowNull: false,
      defaultValue: "draft",
    },
  },
  {
    sequelize: db,
    modelName: "commission_sheet",
    tableName: "commission_sheets",
  },
);

export class CommissionItem extends Model {}
CommissionItem.init(
  {
    itemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    sheetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "commission_sheets", key: "sheet_id" },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "product_id" },
    },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    sequelize: db,
    modelName: "commission_item",
    tableName: "commission_items",
  },
);

export class Product extends Model {}
Product.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productName: { type: DataTypes.STRING, allowNull: false },
    cost: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    defaultPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    commissionRate: { type: DataTypes.DECIMAL(5, 4), allowNull: false },
    spiff: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  },
  { sequelize: db, modelName: "product", tableName: "products" },
);

export class Client extends Model {}
Client.init(
  {
    clientId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientName: { type: DataTypes.STRING, allowNull: false },
  },
  { sequelize: db, modelName: "client", tableName: "clients" },
);

CommissionSheet.hasMany(CommissionItem, { foreignKey: "sheetId" });
CommissionItem.belongsTo(CommissionSheet, { foreignKey: "sheetId" });

Product.hasMany(CommissionItem, { foreignKey: "productId" });
CommissionItem.belongsTo(Product, { foreignKey: "productId" });

export { db };
