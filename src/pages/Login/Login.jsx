import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = ({ account, setUser }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Ensure wallet is connected
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }

    try {
      // Send email, password, and wallet address to backend
      const res = await axios.post("http://localhost:4000/api/user/login", {
        email: form.email,
        password: form.password,
        walletAddress: account,
      },
      {
      withCredentials: true, // 🔥 REQUIRED FOR SESSION
    });

      if (res.data.success) {
        toast.success("Login successful!");
        setUser(res.data.user); // Set user in App.jsx state
        setTimeout(() => navigate("/"), 1000); // redirect to home
      } else {
        toast.error(res.data.message || "Invalid credentials or wallet address");
      }
    } catch (err) {
      toast.error("Error connecting to server");
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
          />

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
            />
            <span
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Wallet address field: hide actual address after connection */}
          {account && (
            <input
              type="text"
              value="Wallet connected"
              readOnly
              className="wallet-field"
            />
          )}

          <button type="submit" className="login-btn">
            Log In
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <span className="signup-link" onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
