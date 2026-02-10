import { NavLink } from "react-router";

const Nav = () => {
  return (
    <div className="nav-wrapper">
      <div className="nav-container">
        <img
          src="/public/p1p-logo-white.png"
          alt="p1p-logo"
          className="nav-logo"
        />
        <div className="nav-links-wrapper">
          <div className="nav-link-container">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              Commission Sheets
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              Clients
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Nav;
