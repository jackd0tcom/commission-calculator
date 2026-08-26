import express from "express";
import session from "express-session";
import { configDotenv } from "dotenv";
import productCtrl from "./controllers/productCtrl";
import commissionCtrl from "./controllers/commissionCtrl";
import userCtrl from "./controllers/userCtrl";
import vendorCtrl from "./controllers/vendorCtrl.js";
import clientCtrl from "./controllers/clientCtrl";
import orderCtrl from "./controllers/orderCtrl.js";
import deliveryCtrl from "./controllers/deliveryCtrl.js";
import linkCtrl from "./controllers/linkCtrl.js";
import productionCtrl from "./controllers/productionCtrl.js";
import responaCtrl from "./controllers/responaCtrl.js";
import statCtrl from "./controllers/statCtrl.js";

const {
  newResponaPlacement,
  newWebhookEvent,
  removeResponaPlacement,
  deleteResponaOrder,
  pushResponaOrder,
} = responaCtrl;

const {
  getProducts,
  updateProduct,
  deleteProduct,
  newProduct,
  getAdminProducts,
  updateUserCommissionRate,
} = productCtrl;

const { getVendors, getVendor } = vendorCtrl;

const { getLinks, updateLink, deleteLink, newLink } = linkCtrl;
const {
  getOrders,
  newOrder,
  newCalculatorOrder,
  getOrder,
  updateOrderItem,
  newOrderItem,
  deleteOrderItem,
  updateOrder,
  deleteOrder,
  getSheetOrderItems,
  updateOrderStatus,
  bulkUpdateOrderStatus,
  duplicateOrderItem,
  updateCalculatorOrder,
  updateOrderItemProduct,
  newLinkPortalOrder,
  massDuplicateOrderItem,
  bulkDeleteOrderItem,
  duplicateOrder,
  bulkUpdateOrderItemProduct,
  bulkUpdateOrderItem,
  bulkReorderOrderItem,
} = orderCtrl;
const {
  getCommissionSheets,
  getPendingSheets,
  getSheet,
  checkMonthlySheet,
  updateSheet,
  newSheet,
  deleteSheet,
} = commissionCtrl;
const { syncAuth0User, getUsers, updateAdmin } = userCtrl;
const {
  getClients,
  updateClient,
  deleteClient,
  newClient,
  addNewClient,
  getClientOrders,
} = clientCtrl;

const { newDelivery, deleteDelivery } = deliveryCtrl;

const { getDashboardStats } = statCtrl;

const { getProductionOrderItems } = productionCtrl;

export function createApp() {
  configDotenv();

  const app = express();

  // Required when behind a reverse proxy (e.g. Railway) so redirects and protocol are correct
  app.set("trust proxy", 1);

  app.use(express.urlencoded({ extended: false }));
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        // HMAC verification needs the exact bytes Respona signed.
        if (req.originalUrl?.split("?")[0] === "/api/respona/webhook") {
          (req as typeof req & { rawBody?: Buffer }).rawBody = buf;
        }
      },
    }),
  );
  app.use(
    session({
      saveUninitialized: true,
      resave: false,
      secret: "as;ldfkjas;dlkjfgasdfl;jkghjsd;kl",
      cookie: {
        maxAge: 1000 * 60 * 60 * 48,
      },
    }),
  );
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    next();
  });

  // Respona Webhook
  app.post("/api/respona/webhook", newWebhookEvent);

  // Respona endpoints
  app.post("/api/respona/newResponaPlacement", newResponaPlacement);
  app.post("/api/respona/removeResponaPlacement", removeResponaPlacement);
  app.post("/api/respona/deleteResponaOrder", deleteResponaOrder);
  app.post("/api/respona/pushResponaOrder", pushResponaOrder);

  // Product endpoints
  app.get("/api/getProducts/:userId", getProducts);
  app.get("/api/getAdminProducts/", getAdminProducts);
  app.post("/api/updateProduct", updateProduct);
  app.post("/api/updateUserCommissionRate", updateUserCommissionRate);
  app.post("/api/deleteProduct", deleteProduct);
  app.post("/api/newProduct", newProduct);

  // Link endpoints
  app.get("/api/getLinks", getLinks);
  app.post("/api/updateLink", updateLink);
  app.post("/api/deleteLink", deleteLink);
  app.post("/api/newLink", newLink);

  // Vendor endpoints
  app.get("/api/getVendors", getVendors);
  app.get("/api/getVendor/:vendorId", getVendor);

  // Commission endpoints
  app.get("/api/getCommissionSheets", getCommissionSheets);
  app.get(`/api/getSheet/:sheetId`, getSheet);
  app.get(`/api/checkMonthlySheet`, checkMonthlySheet);
  app.post("/api/getPendingSheets", getPendingSheets);
  app.post(`/api/newSheet`, newSheet);
  app.post("/api/updateSheet", updateSheet);
  app.post(`/api/deleteSheet`, deleteSheet);

  // Order endpoints
  app.get("/api/getOrders", getOrders);
  app.get("/api/getSheetOrderItems:sheetId", getSheetOrderItems);
  app.get(`/api/getOrder/:orderId`, getOrder);
  app.post(`/api/updateOrderItem`, updateOrderItem);
  app.post(`/api/updateOrderItemProduct`, updateOrderItemProduct);
  app.post(`/api/updateOrderStatus`, updateOrderStatus);
  app.post(`/api/bulkUpdateOrderStatus`, bulkUpdateOrderStatus);
  app.post(`/api/newOrder`, newOrder);
  app.post(`/api/newCalculatorOrder`, newCalculatorOrder);
  app.post(`/api/newLinkPortalOrder`, newLinkPortalOrder);
  app.post("/api/updateOrder", updateOrder);
  app.post("/api/updateCalculatorOrder", updateCalculatorOrder);
  app.post(`/api/newOrderItem`, newOrderItem);
  app.post(`/api/deleteOrderItem`, deleteOrderItem);
  app.post(`/api/bulkDeleteOrderItem`, bulkDeleteOrderItem);
  app.post(`/api/duplicateOrderItem`, duplicateOrderItem);
  app.post(`/api/massDuplicateOrderItem`, massDuplicateOrderItem);
  app.post(`/api/deleteOrder`, deleteOrder);
  app.post(`/api/duplicateOrder`, duplicateOrder);
  app.post(`/api/bulkUpdateOrderItemProduct`, bulkUpdateOrderItemProduct);
  app.post(`/api/bulkUpdateOrderItem`, bulkUpdateOrderItem);
  app.post(`/api/bulkReorderOrderItem`, bulkReorderOrderItem);

  // Client endpoints
  app.get(`/api/getClients`, getClients);
  app.post("/api/updateClient", updateClient);
  app.post("/api/deleteClient", deleteClient);
  app.post("/api/newClient", newClient);
  app.post("/api/addNewClient", addNewClient);
  app.get("/api/getClientOrders/:clientId", getClientOrders);

  // Delivery endpoints
  app.post("/api/newDelivery", newDelivery);
  app.post("/api/deleteDelivery", deleteDelivery);

  // auth endpoints
  app.post("/api/sync-auth0-user", syncAuth0User);
  app.post("/api/updateAdmin", updateAdmin);
  app.get("/api/getUsers", getUsers);

  // Stat endpoints
  app.get("/api/getDashboardStats", getDashboardStats);

  // Production endpoints
  app.get("/api/getProductionOrderItems", getProductionOrderItems);

  return app;
}
