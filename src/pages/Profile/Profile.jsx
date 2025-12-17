import React from "react";
import "./Profile.css";

const Profile = ({ currentUser }) => {
  if (!currentUser) {
    return (
      <div className="profile-container">
        <h2>Please log in first.</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-box">
        <h2>My Profile</h2>

        <div className="profile-info">
          <p><span>Name:</span> {currentUser.name}</p>
          <p><span>Email:</span> {currentUser.email}</p>
          <p><span>Wallet:</span> {currentUser.walletAddress}</p>
          <p><span>Physical Address:</span> {currentUser.userAddress || "N/A"}</p>
          <p><span>Contact Number:</span> {currentUser.contact || "N/A"}</p>
          <p><span>Role:</span> {currentUser.role}</p>
        </div>

        <button className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default Profile;
