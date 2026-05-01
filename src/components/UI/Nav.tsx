import { NavLink } from "react-router";
import { FaCalculator } from "react-icons/fa6";
import { FaBasketShopping } from "react-icons/fa6";
import { BsFillPersonBadgeFill } from "react-icons/bs";
import ProfilePic from "./ProfilePic";
import { useSelector } from "react-redux";
import { FaListCheck } from "react-icons/fa6";
import { FaUserTie } from "react-icons/fa";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa6";
import { FaLink } from "react-icons/fa";
import { FaStore } from "react-icons/fa";
import { FaMoneyBillWave } from "react-icons/fa";
import { RiDashboardHorizontalFill } from "react-icons/ri";

import HideNavToggle from "./HideNavToggle";

interface props {
  setShowNav: any;
  showNav: any;
}

const Nav = ({ setShowNav, showNav }: props) => {
  const user = useSelector((state: any) => state.user);

  return (
    <div className={showNav ? "nav-wrapper" : "nav-wrapper hidden-nav"}>
      <div
        className="hide-nav-toggle-wrapper"
        onClick={() => setShowNav(false)}
      >
        <HideNavToggle borderColor={"white"} />
      </div>
      <div className="nav-container">
        <img src="/p1p-logo-white.png" alt="p1p-logo" className="nav-logo" />
        <div className="nav-links-wrapper">
          <div className="nav-link-container">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <RiDashboardHorizontalFill />
              Dashboard
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
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaBoxOpen />
              Orders
            </NavLink>
            <NavLink
              to="/commission-sheets"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaMoneyBillWave /> Commission Sheets
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
              to="/links"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaLink />
              Links
            </NavLink>
            <NavLink
              to="/vendors"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaStore />
              Vendors
            </NavLink>
            <NavLink
              to="/quote"
              className={({ isActive }) =>
                isActive ? "active-nav nav-button" : "inactive-nav nav-button"
              }
            >
              <FaCalculator />
              Quote Calculator
            </NavLink>
          </div>
        </div>
      </div>
      <div className="nav-links-wrapper no-bottom-border">
        <div className="nav-link-container">
          {user.isAdmin && (
            <>
              <NavLink
                to="/submitted-sheets"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <FaListCheck />
                Submitted Sheets
              </NavLink>
              <NavLink
                to="/approved-sheets"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <FaMoneyCheckDollar />
                Approved Sheets
              </NavLink>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "active-nav nav-button" : "inactive-nav nav-button"
                }
              >
                <FaUserTie />
                Admin
              </NavLink>
            </>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "active-nav nav-button" : "inactive-nav nav-button"
            }
          >
            <ProfilePic src={user.profilePic} />
            Profile
          </NavLink>
        </div>
      </div>
    </div>
  );
};
export default Nav;
