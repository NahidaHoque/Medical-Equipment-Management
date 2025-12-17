import React, { useState, useEffect } from "react";
import api from "./api/axios";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Web3 from "web3";
import { loadContract } from "./utils/loadContract";

// Components
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// Pages
import Home from "./pages/Home/Home";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Cart from "./pages/Cart/Cart";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import Profile from "./pages/Profile/Profile";
import RawMaterials from "./pages/Rawmaterials/Rawmaterials";
import AvailableRawMaterials from "./pages/Manufacturer/availableRawMaterials";
import SupplierRequests from "./pages/SupplierRequests/SupplierRequests";
import CreateEquipment from "./pages/CreateEquipment/CreateEquipment";
import Verification from "./pages/Verifications/Verifications";
import Requests from "./pages/Requests/Requests";
import AvailableEquipment from "./pages/AvailableEquipment/AvailableEquipment";
import Transporter from "./pages/Transporter/Transporter";
import Prediction from "./pages/ManufacturerPrediction/Prediction";
import SupPrediction from "./pages/SupplierPrediction/SupPrediction";

// Pages for hospital orders
import OrderPage from "./pages/PlaceOrder/PlaceOrder";

// ---------------- Error Boundary ----------------
const ErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (err) {
    console.error("Error caught in ErrorBoundary:", err);
    return <p style={{ padding: 20, color: "red" }}>Something went wrong.</p>;
  }
};

const App = () => {
  const [account, setAccount] = useState(null);
  const [user, setUser] = useState(null);
  const [contract, setContract] = useState(null);
  const backendURL = "http://localhost:4000";

  // ---------------- Connect Wallet ----------------
  const connectWallet = async () => {
    try {
      if (!window.ethereum) return toast.error("Please install MetaMask!");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) return toast.warning("No accounts found");

      setAccount(accounts[0]);
      toast.success("Wallet connected!");

      const web3 = new Web3(window.ethereum);
      const loadedContract = await loadContract(web3);
      setContract(loadedContract);

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || null);
        if (!accounts[0]) setUser(null);
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect wallet or load contract");
    }
  };

  // Auto-connect wallet
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) connectWallet();
      });
    }
  }, []);

  // 🔁 Restore logged-in user from SESSION (IMPORTANT)
  useEffect(() => {
    api
      .get("/api/user/me")
      .then((res) => {
        if (res.data.success) {
          setUser(res.data.user);
        }
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        <ToastContainer />

        <Navbar
          account={account}
          connectToEthereum={connectWallet}
          user={user}
          setUser={setUser}
        />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/cart"
            element={<Cart user={user} contract={contract} account={account} backendUrl={backendURL} />}
          />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/profile" element={<Profile currentUser={user} account={account} />} />

          {/* Supplier */}
          <Route
            path="/producer/raw-materials"
            element={contract && account ? <RawMaterials contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          <Route
            path="/supplier/requests"
            element={contract && account ? <SupplierRequests contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          <Route
            path="/supplier/supprediction"
            element={contract && account ? <SupPrediction user={user} contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          {/* Manufacturer */}
          <Route
            path="/manufacturer/available-raw-materials"
            element={contract && account ? <AvailableRawMaterials contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          <Route
            path="/manufacturer/create-equipment"
            element={contract && account ? <CreateEquipment contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          <Route
            path="/manufacturer/verified-materials"
            element={contract && account ? <Verification contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          <Route
            path="/manufacturer/prediction"
            element={contract && account ? <Prediction contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          {/* Stakeholder */}
          <Route
            path="/stakeholder/requests-for-verification"
            element={contract && account ? <Requests contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          {/* Hospital */}
          <Route
            path="/hospital/equipment"
            element={contract && account ? <AvailableEquipment contract={contract} account={account} url={backendURL} user={user} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          <Route
            path="/hospital/myorder"
            element={<OrderPage contract={contract} account={account} url={backendURL} user={user} />}
          />

          {/* Transporter */}
          <Route
            path="/transporter/orders"
            element={contract && account ? <Transporter contract={contract} account={account} url={backendURL} /> : <p style={{ padding: 20 }}>Connect wallet to continue...</p>}
          />

          {/* Auth */}
          <Route path="/signup" element={<Signup account={account} setUser={setUser} />} />
          <Route path="/login" element={<Login account={account} setUser={setUser} />} />
        </Routes>

        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default App;
