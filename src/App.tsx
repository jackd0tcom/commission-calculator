import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes } from "react-router";
import { useState } from "react";
import "./App.css";
import Profile from "./Pages/Profile.tsx";
import Nav from "./components/UI/Nav.tsx";
import Commissions from "./Pages/Commissions.tsx";
import Auth0Sync from "./components/authentication/Auth0Sync.tsx";
import Login from "./Pages/Login.tsx";
import CommissionSheet from "./Pages/CommissionSheet.tsx";
import Products from "./Pages/Products.tsx";
import Clients from "./Pages/Clients.tsx";
import Loader from "./components/UI/Loader.tsx";
import { Navigate } from "react-router";
import { useSelector } from "react-redux";
import Admin from "./Pages/Admin.tsx";
import Submitted from "./Pages/Submitted.tsx";
import Approved from "./Pages/Approved.tsx";
import Orders from "./Pages/Orders.tsx";
import OrderPage from "./Pages/OrderPage.tsx";
import Links from "./Pages/Links.tsx";
import Vendors from "./Pages/Vendors.tsx";
import VendorPage from "./Pages/VendorPage.tsx";
import QuoteGenerator from "./Pages/QuoteGenerator.tsx";

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const [userSynced, setUserSynced] = useState(false);
  const user = useSelector((state: any) => state.user);
  const [showNav, setShowNav] = useState(true);

  if (isLoading) {
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-state">
          <div className="error-title">Oops!</div>
          <div className="error-message">Something went wrong</div>
          <div className="error-sub-message">{error.message}</div>
        </div>
      </div>
    );
  }
  const handleSyncComplete = () => {
    setUserSynced(true);
  };

  return (
    <div className="app-container">
      <Auth0Sync onSyncComplete={handleSyncComplete} />
      {isAuthenticated && showNav ? (
        <Nav setShowNav={setShowNav} showNav={showNav} />
      ) : (
        <div className="hidden-nav-wrapper"></div>
      )}
      {isLoading || (isAuthenticated && !userSynced) ? (
        <div className="app-container">
          <Loader />
        </div>
      ) : (
        <div
          className={
            showNav ? "route-wrapper" : "route-wrapper full-width-wrapper"
          }
        >
          <div className="route-container">
            <Routes>
              <Route
                index
                path="/"
                element={
                  !isAuthenticated ? <Login /> : <Navigate to="/orders" />
                }
              ></Route>
              <Route
                path="/commission-sheets"
                element={<Commissions />}
              ></Route>
              <Route path="/orders" element={<Orders />}></Route>
              <Route
                path="/order/:orderId/:calculatorOrder"
                element={<OrderPage />}
              ></Route>
              <Route path="/profile" element={<Profile />}></Route>
              <Route
                path="/sheet/:sheetId"
                element={<CommissionSheet />}
              ></Route>
              <Route path="/products" element={<Products />}></Route>
              <Route path="/links" element={<Links />}></Route>
              <Route path="/vendors" element={<Vendors />}></Route>
              <Route path="/vendor/:vendorId" element={<VendorPage />}></Route>
              <Route path="/clients" element={<Clients />}></Route>
              <Route
                path="/quote"
                element={
                  <QuoteGenerator showNav={showNav} setShowNav={setShowNav} />
                }
              ></Route>
              <Route
                path="/submitted-sheets"
                element={
                  !isAuthenticated ? (
                    <Login />
                  ) : user.isAdmin ? (
                    <Submitted />
                  ) : (
                    <Navigate to="/commission-sheets" />
                  )
                }
              ></Route>
              <Route
                path="/approved-sheets"
                element={
                  !isAuthenticated ? (
                    <Login />
                  ) : user.isAdmin ? (
                    <Approved />
                  ) : (
                    <Navigate to="/commission-sheets" />
                  )
                }
              ></Route>
              <Route
                path="/admin"
                element={
                  !isAuthenticated ? (
                    <Login />
                  ) : user.isAdmin ? (
                    <Admin />
                  ) : (
                    <Navigate to="/commission-sheets" />
                  )
                }
              ></Route>
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
