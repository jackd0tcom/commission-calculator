import { NavLink } from "react-router";
import { FaCalculator } from "react-icons/fa6";
import { FaBasketShopping } from "react-icons/fa6";
import { BsFillPersonBadgeFill } from "react-icons/bs";
import ProfilePic from "./ProfilePic";
import { useSelector } from "react-redux";
import { FaListCheck } from "react-icons/fa6";

const Nav = () => {
  const user = useSelector((state) => state.user);

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
              to="/commission-sheets"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaCalculator /> Commission Sheets
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaBasketShopping />
              Products
            </NavLink>
            <NavLink
              to="/clients"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <BsFillPersonBadgeFill />
              Clients
            </NavLink>
            {user.isAdmin && (
              <NavLink
                to="/pending"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <FaListCheck />
                Pending Sheets
              </NavLink>
            )}
          </div>
        </div>
      </div>
      <div className="nav-links-wrapper no-bottom-border">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? "active-nav nav-button" : "inactive-nav nav-button"
          }
        >
          <ProfilePic />
          Profile
        </NavLink>
      </div>
    </div>
  );
};
export default Nav;
