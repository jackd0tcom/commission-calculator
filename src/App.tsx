import { useAuth0 } from "@auth0/auth0-react";
import { Route, Routes } from "react-router";
import "./App.css";
import Profile from "./Pages/Profile.tsx";
import Nav from "./components/UI/Nav.tsx";
import Commissions from "./Pages/Commissions.tsx";

function App() {
  const { isAuthenticated, isLoading, error } = useAuth0();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading-state">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
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

  return (
    <div className="app-container">
      <Nav />
      <div className="route-wrapper">
        <div className="route-container">
          <Routes>
            <Route index element={<Commissions />}></Route>
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default App;
