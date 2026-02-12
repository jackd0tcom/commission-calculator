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
import { Navigate } from "react-router";

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const [userSynced, setUserSynced] = useState(false);

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
      <Nav />
      {isLoading ? (
        <div className="app-container">
          <div className="loading-state">
            <div className="loading-text">Loading...</div>
          </div>
        </div>
      ) : (
        <div className="route-wrapper">
          <div className="route-container">
            <Routes>
              <Route index path="/" element={<Login />}></Route>
              <Route
                path="/commission-sheets"
                element={<Commissions />}
              ></Route>
              <Route path="/profile" element={<Profile />}></Route>
              <Route
                path="/sheet/:sheetId"
                element={<CommissionSheet />}
              ></Route>
            </Routes>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
