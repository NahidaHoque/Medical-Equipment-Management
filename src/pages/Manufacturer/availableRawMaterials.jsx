import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./availableRawMaterials.css";

const AvailableRawMaterials = ({ account, url, contract }) => {
  const [materials, setMaterials] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [supplierNames, setSupplierNames] = useState({});
  const navigate = useNavigate();

  // ---------------- Load available raw materials ----------------
  const loadAvailable = async () => {
    try {
      const { data } = await axios.get(`${url}/api/raw`);
      const materialsWithNames = await Promise.all(
        data.map(async (m) => {
          let supplierName = supplierNames[m.supplier] || "Unknown";
          if (!supplierNames[m.supplier]) {
            try {
              const res = await axios.get(`${url}/api/user/byWallet/${m.supplier}`);
              supplierName = res.data.username || "Unknown";
              setSupplierNames((prev) => ({ ...prev, [m.supplier]: supplierName }));
            } catch (err) {
              console.warn("Failed to fetch supplier name for", m.supplier);
            }
          }

          return {
            ...m,
            requestQty: 1,
            status: m.status || "pending",
            supplierId: m.supplier,
            requestId: m._id, // DB _id
            supplierName,
            contractRawId: m.rawId, // Blockchain ID
          };
        })
      );

      setMaterials(materialsWithNames);
    } catch (err) {
      console.error(err);
      toast.error("Error loading raw materials from database");
    }
  };

  // ---------------- Load approved requests ----------------
  const loadApprovedRequests = async () => {
    if (!account) return;
    try {
      const { data } = await axios.get(`${url}/api/supplier-approved-requests/manufacturer/${account}`);
      if (data.success) setApprovedRequests(data.requests);
    } catch (err) {
      console.error(err);
      toast.error("Error loading approved requests");
    }
  };
  
  // ---------------- Send request to blockchain and save in MongoDB ----------------
const sendRequest = async (item) => {
  if (!account) return toast.error("Connect wallet first!");
  if (!contract) return toast.error("Contract not loaded!");

  try {
    // --------------- 1) Send transaction to Smart Contract -----------------
    const tx = await contract.methods
      .requestRawMaterial(item.contractRawId, Number(item.requestQty))
      .send({ from: account, gas: 500000 });

    const contractRequestId =
      tx.events.RawMaterialRequested.returnValues.requestId.toString();

    // --------------- 2) Save request into MongoDB -----------------
    await axios.post(`${url}/api/raw-material-requests/add`, {
      rawId: Number(item.contractRawId),                        // DB Raw Material ID
      contractRequestId,                      // Smart contract request ID
      manufacturerAddress: account,           // Manufacturer wallet
      supplierId: item.supplierId,            // Supplier wallet
      supplierName: item.supplierName,        // Supplier name
      name: item.name,                        // Raw material name
      quantity: Number(item.requestQty),      // Requested quantity
      price: item.price,                      // Price per unit
      totalPrice: Number(item.price) * Number(item.requestQty),
      status: "pending",                      // Default request status
      txHash: tx.transactionHash,             // Blockchain transaction hash
      image: item.image,                      // Raw material image
    });

    toast.success("Request sent successfully!");

    // Reload tables
    loadAvailable();
    loadApprovedRequests();
    
  } catch (err) {
    console.error("Error sending request:", err);
    toast.error("Request failed! Check console and wallet/network.");
  }
};


  
  // ---------------- Update request quantity ----------------
  const updateQuantity = (id, value) => {
    setMaterials((prev) =>
      prev.map((m) => {
        if (m.rawId === id) {
          let qty = Number(value);
          if (qty > m.quantity) qty = m.quantity;
          if (qty < 1) qty = 1;
          return { ...m, requestQty: qty };
        }
        return m;
      })
    );
  };

  useEffect(() => {
    loadAvailable();
    loadApprovedRequests();
  }, []);

  return (
    <div className="raw-materials-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2>Available Raw Materials</h2>
      <table className="raw-material-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Available Qty</th>
            <th>Price/unit</th>
            <th>Total Price</th>
            <th>Producer</th>
            <th>Image</th>
            <th>Request Qty</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m.rawId}>
              <td>{m.rawId}</td>
              <td>{m.name}</td>
              <td>{m.quantity}</td>
              <td>{m.price}</td>
              <td>{m.price * m.requestQty}</td>
              <td>{m.supplierName}</td>
              <td>{m.image ? <img src={`${url}/raw_uploads/${m.image}`} alt={m.name} height="40" /> : "No Image"}</td>
              <td>
                <input
                  type="number"
                  min="1"
                  max={m.quantity}
                  value={m.requestQty}
                  onChange={(e) => updateQuantity(m.rawId, e.target.value)}
                />
              </td>
              <td>{m.status}</td>
              <td>
                {m.status === "pending" && (
                  <button
                    className="request-btn"
                    onClick={() => sendRequest(m)}
                  >
                    Request
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: "40px" }}>Supplier Approved Requests</h2>
      <table className="raw-material-list">
        <thead>
          <tr>
            <th>Raw ID</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price/unit</th>
            <th>Total Price</th>
            <th>Raw-material Producer</th>
            <th>Status</th>
            <th>Image</th>
            <th>Create Equipment</th>
          </tr>
        </thead>
        <tbody>
          {approvedRequests.length === 0 ? (
            <tr><td colSpan="9">No approved requests</td></tr>
          ) : (
            approvedRequests.map((r) => (
              <tr key={r._id}>
                <td>{r.rawId}</td>
                <td>{r.name}</td>
                <td>{r.quantity}</td>
                <td>{r.price}</td>
                <td>{r.totalPrice}</td>
                <td>{r.supplierName || "Unknown"}</td>
                <td className={`status-${r.status}`}>{r.status}</td>
                <td>{r.image ? <img src={`${url}/raw_uploads/${r.image}`} alt={r.name} height="40" /> : "No Image"}</td>
                <td>
                  <button
                    className="equipment-button"
                    onClick={() =>
                      navigate("/manufacturer/create-equipment", {
                        state: {
                          rawMaterialRequestId: r.requestApproveId,       // DB request ID
                          rawId: r.rawId,                     // Blockchain ID
                          rawName: r.name,                     // Raw material name
                          rawPrice: r.price,                   // Price per unit of raw material
                          rawQuantity: r.quantity,             // Available raw material quantity
                          rawTotalPrice: r.totalPrice,
                          supplierName: r.supplierName || "Unknown",
                          supplierWallet: r.supplierId || "0xUnknown",
                          manufacturerName: r.manufacturerName || "Manufacturer",
                          image: r.image,
                          usedQuantity: r.usedQuantity || 0,
                        },
                      })
                    }
                    disabled={r.usedQuantity >= r.quantity} // Disable if all units used
                  >
                    {r.usedQuantity >= r.quantity ? "Max Used" : "Create Equipment"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AvailableRawMaterials;
