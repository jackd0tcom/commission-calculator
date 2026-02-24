import { DataTypes, Model } from "sequelize";
import connectToDb from "./db.js";

const db = await connectToDb(
  process.env.DATABASE_URL || "postgresql:///commission-db",
);

export class User extends Model {}
User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    auth0Id: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
    },
    lastName: {
      type: DataTypes.STRING,
    },
    profilePic: {
      type: DataTypes.TEXT,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    googleAccessToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleTokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  { sequelize: db, modelName: "user", tableName: "users", timestamps: true },
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
    timestamps: true,
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
      allowNull: true,
      references: { model: "products", key: "product_id" },
    },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "clients", key: "client_id" },
    },
  },
  {
    sequelize: db,
    modelName: "commission_item",
    tableName: "commission_items",
    timestamps: true,
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
  {
    sequelize: db,
    modelName: "product",
    tableName: "products",
    timestamps: true,
  },
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
  },
  {
    sequelize: db,
    modelName: "client",
    tableName: "clients",
    timestamps: true,
  },
);

CommissionSheet.hasMany(CommissionItem, { foreignKey: "sheetId" });
CommissionItem.belongsTo(CommissionSheet, { foreignKey: "sheetId" });

Product.hasMany(CommissionItem, { foreignKey: "productId" });
CommissionItem.belongsTo(Product, { foreignKey: "productId" });

export { db };
