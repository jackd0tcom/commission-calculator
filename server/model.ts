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
      type: DataTypes.ENUM("draft", "submitted", "approved", "denied", "paid"),
      allowNull: false,
      defaultValue: "draft",
    },
    submitDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "commission_sheet",
    tableName: "commission_sheets",
    timestamps: true,
  },
);

export class Order extends Model {}
Order.init(
  {
    orderId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sheetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "commission_sheets", key: "sheet_id" },
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "clients", key: "client_id" },
    },
    orderStatus: {
      type: DataTypes.ENUM("placed", "in progress", "delivered"),
      allowNull: false,
      defaultValue: "placed",
    },
  },
  {
    sequelize: db,
    modelName: "order",
    tableName: "orders",
    timestamps: true,
  },
);

export class OrderItem extends Model {}
OrderItem.init(
  {
    itemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "orders", key: "orderId" },
    },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "products", key: "productId" },
    },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    productNameSnapshot: { type: DataTypes.STRING, allowNull: true },
    defaultPriceSnapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    commissionRateSnapshot: { type: DataTypes.DECIMAL(5, 4), allowNull: true },
    spiffSnapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    costSnapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    priceSnapshot: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  },
  {
    sequelize: db,
    modelName: "order_item",
    tableName: "order_items",
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
    productName: { type: DataTypes.STRING, allowNull: true },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10,
    },
    defaultPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 10,
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.5,
    },
    spiff: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    modelName: "product",
    tableName: "products",
    timestamps: true,
  },
);

export class UserProductCommission extends Model {}
UserProductCommission.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products", key: "productId" },
    },
    commissionRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "user_product_commission",
    tableName: "user_product_commissions",
    timestamps: true,
    indexes: [{ unique: true, fields: ["user_id", "product_id"] }],
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
    clientName: { type: DataTypes.STRING, allowNull: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users", key: "user_id" },
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize: db,
    modelName: "client",
    tableName: "clients",
    timestamps: true,
  },
);

CommissionSheet.hasMany(Order, { foreignKey: "sheet_id" });
Order.belongsTo(CommissionSheet, { foreignKey: "sheet_id" });

Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

Order.belongsTo(Client, { foreignKey: "client_id", as: "client" });
Client.hasMany(Order, {
  foreignKey: "client_id",
  as: "orderItems",
});

Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

User.hasMany(CommissionSheet, { foreignKey: "userId" });
CommissionSheet.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId" });
Order.belongsTo(User, { foreignKey: "userId" });

User.belongsToMany(Product, {
  through: UserProductCommission,
  foreignKey: "userId",
});
Product.belongsToMany(User, {
  through: UserProductCommission,
  foreignKey: "productId",
});
Product.hasMany(UserProductCommission, { foreignKey: "product_id" });
UserProductCommission.belongsTo(Product, { foreignKey: "product_id" });

export { db };
