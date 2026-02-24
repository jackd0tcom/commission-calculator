import express from "express";
import ViteExpress from "vite-express";
import session from "express-session";
import { configDotenv } from "dotenv";
import productCtrl from "./controllers/productCtrl";
import commissionCtrl from "./controllers/commissionCtrl";
import authCtrl from "./controllers/authCtrl";
import clientCtrl from "./controllers/clientCtrl";

const { getProducts } = productCtrl;
const { getCommissionSheets, getSheet, updateSheetItem } = commissionCtrl;
const { syncAuth0User } = authCtrl;
const { getClients } = clientCtrl;

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

// Commission endpoints
app.get("/api/getCommissionSheets", getCommissionSheets);
app.get(`/api/getSheet/:sheetId`, getSheet);
app.post(`/api/updateSheetItem`, updateSheetItem);

// Client endpoints
app.get(`/api/getClients`, getClients);

// auth endpoints
// app.post("/api/register", register);
// app.post("/api/login", login);
// app.get("/api/checkUser", checkUser);
// app.delete("/api/logout", logout);
// // app.put("/api/updateUser", updateUser);
app.post("/api/sync-auth0-user", syncAuth0User);

ViteExpress.listen(app, PORT, () => {
  console.log(`live on http://localhost:${PORT}`);
});
