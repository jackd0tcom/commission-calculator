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

export class Vendor extends Model {}
Vendor.init(
  {
    vendorId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendorName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    googleSheetId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "vendor",
    tableName: "vendors",
    timestamps: true,
  },
);

export class VendorField extends Model {}
VendorField.init(
  {
    vendorFieldId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "vendors" },
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fieldType: {
      type: DataTypes.ENUM("string", "number", "boolean", "date", "enum"),
      allowNull: false,
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    sortIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    defaultValue: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleSheetId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "vendor_field",
    tableName: "vendor_fields",
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
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "clients" },
    },
    orderStatus: {
      type: DataTypes.ENUM("in progress", "delivered"),
      allowNull: false,
      defaultValue: "in progress",
    },
    salesPerson: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "users" },
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
      references: { model: "orders" },
    },
    orderIndex: {
      type: DataTypes.FLOAT,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "products" },
    },
    productType: {
      type: DataTypes.ENUM("product", "link"),
      allowNull: false,
    },
    itemStatus: {
      type: DataTypes.ENUM(
        "staged",
        "ordered",
        "in progress",
        "cancelled",
        "support needed",
        "complete",
      ),
      allowNull: false,
      defaultValue: "staged",
    },
    vendorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "vendors" },
    },
    vendorPayload: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    targetUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    anchorText: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    linkingFrom: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    linkingTo: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveredAnchorText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dateReported: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    da: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dr: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tf: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    cf: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    traffic: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    managerApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    sheetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "commission_sheets", key: "sheet_id" },
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

export class Delivery extends Model {}
Delivery.init(
  {
    deliveryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "order_items" },
    },
    sheetId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "commission_sheets", key: "sheet_id" },
    },
    deliveredQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    sequelize: db,
    modelName: "delivery",
    tableName: "deliveries",
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
      references: { model: "users" },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "products" },
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

export class Link extends Model {}
Link.init(
  {
    linkId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    linkName: { type: DataTypes.STRING, allowNull: true },
    url: { type: DataTypes.STRING, allowNull: true },
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
    modelName: "link",
    tableName: "links",
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
    clientName: { type: DataTypes.STRING, allowNull: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: "users" },
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

CommissionSheet.hasMany(Order, { foreignKey: "sheetId" });
Order.belongsTo(CommissionSheet, { foreignKey: "sheetId" });

Order.hasMany(OrderItem, { foreignKey: "orderId" });
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

Order.belongsTo(Client, { foreignKey: "clientId", as: "client" });
Client.hasMany(Order, { foreignKey: "clientId", as: "orders" });

Product.hasMany(OrderItem, { foreignKey: "productId" });
OrderItem.belongsTo(Product, { foreignKey: "productId" });

Vendor.hasMany(VendorField, { foreignKey: "vendorId" });
VendorField.belongsTo(Vendor, { foreignKey: "vendorId" });

Vendor.hasMany(OrderItem, { foreignKey: "vendorId" });
OrderItem.belongsTo(Vendor, { foreignKey: "vendorId" });

OrderItem.hasMany(Delivery, { foreignKey: "itemId" });
Delivery.belongsTo(OrderItem, { foreignKey: "itemId" });

CommissionSheet.hasMany(Delivery, { foreignKey: "sheetId" });
Delivery.belongsTo(CommissionSheet, { foreignKey: "sheetId" });

User.hasMany(CommissionSheet, { foreignKey: "userId" });
CommissionSheet.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Client, { foreignKey: "userId" });
Client.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(Order, {
  foreignKey: "salesPerson",
  as: "salesPersonOrders",
});
Order.belongsTo(User, {
  foreignKey: "salesPerson",
  as: "salesPersonUser",
});

User.belongsToMany(Product, {
  through: UserProductCommission,
  foreignKey: "userId",
});
Product.belongsToMany(User, {
  through: UserProductCommission,
  foreignKey: "productId",
});
Product.hasMany(UserProductCommission, { foreignKey: "productId" });
UserProductCommission.belongsTo(Product, { foreignKey: "productId" });
User.hasMany(UserProductCommission, { foreignKey: "userId" });
UserProductCommission.belongsTo(User, { foreignKey: "userId" });

export { db };
