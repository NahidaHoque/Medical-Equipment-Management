import React, { useEffect, useState } from "react";
import "./Header.css";
import { toast } from "react-toastify";

const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState(null);

  // Check if MetaMask is already connected
  useEffect(() => {
    const checkConnection = async () => {
      const { ethereum } = window;
      if (!ethereum) return;

      try {
        const accounts = await ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          toast.info("Wallet already connected");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to check wallet connection");
      }
    };

    checkConnection();
  }, []);

  // Open MetaMask popup
  const openMetaMask = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      toast.error("Please install MetaMask!");
      return;
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        toast.success("Wallet connected successfully!");
      }
    } catch (err) {
      console.error("Failed to open MetaMask:", err);
      toast.error("Failed to connect wallet");
    }
  };

  return (
    <div className="header">
      <div className="header-contents">
        <h2>Find your Medical Equipment here...</h2>
        <p>
          We provide high-quality, reliable medical equipment designed to support
          hospitals, clinics, and home healthcare needs. Our mission is to ensure
          patient safety and comfort through innovative, durable, and affordable
          healthcare solutions.
        </p>

        {/* Button opens MetaMask */}
        <button onClick={openMetaMask}>
          {isConnected
            ? `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`
            : "Connect to MetaMask"}
        </button>
      </div>
    </div>
  );
};

export default Header;
