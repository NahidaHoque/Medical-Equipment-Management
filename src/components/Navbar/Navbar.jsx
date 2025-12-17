import React from "react";
import api from "../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const Navbar = ({ account, connectToEthereum, user, setUser }) => {
  const location = useLocation(); // get current path
  const navigate = useNavigate();

  const getActive = (path) => (location.pathname === path ? "active" : "");

  const handleLogout = async () => {
  try {
    await api.post("/api/user/logout"); // 🔥 destroy session
    setUser(null);
    navigate("/login");
  } catch (err) {
    console.error("Logout failed", err);
  }
};

  return (
    <div className="navbar">
      <img src={assets.logo} alt="" className="logo" />

      <ul className="navbar-menu">
        {user && (
          <li className={getActive("/profile")}>
            <Link to="/profile">{user.name.split(" ")[0]}</Link>
          </li>
        )}

        <li className={getActive("/")}>
          <Link to="/">home</Link>
        </li>

        {/* 🔐 Super Admin Dashboard */}
        {user?.role === "superadmin" && (
          <li>
            <a
              href="http://localhost:5174"   // admin app URL
              target="_blank"
              rel="noopener noreferrer"
              className="admin-link"
            >
              Admin Dashboard
            </a>
          </li>
        )}


        {/* Supplier links */}
        {user?.role === "supplier" && (
          <>
            <li className={getActive("/producer/raw-materials")}>
              <Link to="/producer/raw-materials">Raw Materials</Link>
            </li>
            <li className={getActive("/supplier/requests")}>
              <Link to="/supplier/requests">Requests</Link>
            </li>
            <li className={getActive("/supplier/supprediction")}>
              <Link to="/supplier/supprediction">supPrediction</Link>
            </li>
          </>
        )}

        {/* Manufacturer links */}
        {user?.role === "manufacturer" &&
          account?.toLowerCase() === user.walletAddress?.toLowerCase() && (
            <>
              <li className={getActive("/manufacturer/available-raw-materials")}>
                <Link to="/manufacturer/available-raw-materials">
                  AvailableMaterials
                </Link>
              </li>
              <li className={getActive("/manufacturer/create-equipment")}>
                <Link to="/manufacturer/create-equipment">
                  Create Equipment
                </Link>
              </li>
              <li className={getActive("/manufacturer/verified-materials")}>
                <Link to="/manufacturer/verified-materials">
                  Verifications
                </Link>
              </li>
              <li className={getActive("/manufacturer/prediction")}>
                <Link to="/manufacturer/prediction">
                  Prediction
                </Link>
              </li>
            </>
          )}

        {/* Stakeholder links */}
        {user?.role === "stakeholder" && (
          <li className={getActive("/stakeholder/requests-for-verification")}>
            <Link to="/stakeholder/requests-for-verification">
              Requests for Verification
            </Link>
          </li>
        )}

        {/* Hospital links */}
        {user?.role === "hospital" && (
          <>
            <li className={getActive("/hospital/equipment")}>
              <Link to="/hospital/equipment">Equipment</Link>
            </li>
            <li className={getActive("/hospital/myorder")}>
              <Link to="/hospital/myorder">Order</Link>
            </li>
          </>
        )}

        {user?.role === "transporter" && (
          <li className={getActive("/transporter/orders")}>
            <Link to="/transporter/orders">Place Shipped</Link>
          </li>
        )}

        {/* Auth links */}
        {!user && (
          <>
            <li className={getActive("/signup")}>
              <Link to="/signup">Sign Up</Link>
            </li>
            <li className={getActive("/login")}>
              <Link to="/login">Log In</Link>
            </li>
          </>
        )}

        {user && (
          <li>
            <span
              className="logout-link"
              onClick={handleLogout}
              style={{ cursor: "pointer", color: "#030615ff", fontWeight: 400 }}
            >
              Log Out
            </span>
          </li>
        )}
      </ul>

      <div className="navbar-right">
      <img src={assets.search_icon} alt="" />

      <div
        className="navbar-search-icon"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/cart")}
      >
        <img src={assets.basket_icon} alt="Cart" />
        <div className="dot"></div>
      </div>

        <button onClick={connectToEthereum}>
          {account
            ? `${account.substring(0, 6)}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
