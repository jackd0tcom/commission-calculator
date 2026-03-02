import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import { configDotenv } from "dotenv";
import productCtrl from "./controllers/productCtrl";
import commissionCtrl from "./controllers/commissionCtrl";
import userCtrl from "./controllers/userCtrl";
import clientCtrl from "./controllers/clientCtrl";

const { getProducts, updateProduct, deleteProduct, newProduct } = productCtrl;
const {
  getCommissionSheets,
  getPendingSheets,
  getSheet,
  updateSheetItem,
  newSheetItem,
  deleteSheetItem,
  updateSheet,
  newSheet,
  deleteSheet,
} = commissionCtrl;
const { syncAuth0User, getUsers, updateAdmin } = userCtrl;
const { getClients, updateClient, deleteClient, newClient, getClientSheets } =
  clientCtrl;

configDotenv();

// Express setup
const app = express();
const PORT: number = 2020;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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

// Endpoints

// Product endpoints
app.get("/api/getProducts", getProducts);
app.post("/api/updateProduct", updateProduct);
app.post("/api/deleteProduct", deleteProduct);
app.post("/api/newProduct", newProduct);

// Commission endpoints
app.get("/api/getCommissionSheets", getCommissionSheets);
app.get(`/api/getSheet/:sheetId`, getSheet);
app.post("/api/getPendingSheets", getPendingSheets);
app.post(`/api/updateSheetItem`, updateSheetItem);
app.post(`/api/newSheet`, newSheet);
app.post("/api/updateSheet", updateSheet);
app.post(`/api/newSheetItem`, newSheetItem);
app.post(`/api/deleteSheetItem`, deleteSheetItem);
app.post(`/api/deleteSheet`, deleteSheet);

// Client endpoints
app.get(`/api/getClients`, getClients);
app.post("/api/updateClient", updateClient);
app.post("/api/deleteClient", deleteClient);
app.post("/api/newClient", newClient);
app.get("/api/getClientSheets/:clientId", getClientSheets);

// auth endpoints
// app.post("/api/register", register);
// app.post("/api/login", login);
// app.get("/api/checkUser", checkUser);
// app.delete("/api/logout", logout);
// // app.put("/api/updateUser", updateUser);
app.post("/api/sync-auth0-user", syncAuth0User);
app.post("/api/updateAdmin", updateAdmin);
app.get("/api/getUsers", getUsers);

ViteExpress.listen(app, PORT, () => {
  console.log(`live on http://localhost:${PORT}`);
});
