import React from "react";
import "./Footer.css";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and About */}
        <div className="footer-section about">
          <h2>Medical Equipment</h2>
          <p>
            We provide hospitals with high-quality, verified medical equipment to ensure reliable healthcare.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/hospital/equipment">Available Equipment</a></li>
            <li><a href="/manufacturer/create-equipment">Create Equipment</a></li>
            <li><a href="/contactus">Contact Us</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact">
          <h3>Contact</h3>
          <p>Email: support@medicalequipment.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <div className="social-icons">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Medical Equipment. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
