import React, { useState } from "react";
import axios from "axios";
import "./Signup.css";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = ({ account }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    contact: "",
    physicalAddress: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      toast.error("Please connect your wallet first!");
      return;
    }
    if (!form.physicalAddress) {
      toast.error("Please enter your physical address");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/api/user/register", {
        name: form.name,
        email: form.email,
        contact: form.contact,
        userAddress: form.physicalAddress,
        password: form.password,
        walletAddress: account,
      });

      if (res.data.success) {
        toast.success("Registration successful!");
        setTimeout(() => navigate("/login"), 1000);
      } else {
        toast.warning(res.data.message);
      }
    } catch (err) {
      toast.error("Error connecting to server");
      console.log(err);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            onChange={handleChange}
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            required
            onChange={handleChange}
          />

          <input
            type="text"
            name="physicalAddress"
            placeholder="Physical Address"
            required
            onChange={handleChange}
          />

          {/* Password input */}
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

          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
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

          <input
            type="text"
            value={account || "Connect wallet first"}
            readOnly
            className="wallet-field"
          />

          <button
            type="submit"
            className="signup-btn"
            disabled={!account || !form.physicalAddress}
          >
            Sign Up
          </button>
        </form>

        <p className="login-text">
          Already have an account?{" "}
          <span className="login-link" onClick={() => navigate("/login")}>
            Log in
          </span>
        </p>
      </div>
    </div>
  );
};

export default Signup;
