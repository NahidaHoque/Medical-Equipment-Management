import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './SupplierRequests.css';

const SupplierRequests = ({ account, url, contract }) => {
  const [requests, setRequests] = useState([]);
  const [manufacturerNames, setManufacturerNames] = useState({});

  // ---------------- Load requests from backend ----------------
  const loadRequests = async () => {
    if (!account) return;

    try {
      const { data } = await axios.get(`${url}/api/raw-material-requests/supplier/${account}/requests`);
      if (data.success) {
        const requestsWithNames = await Promise.all(
          data.requests.map(async (r) => {
            let manufacturerName = manufacturerNames[r.manufacturerAddress] || "";

            if (!manufacturerName) {
              try {
                const res = await axios.get(`${url}/api/user/byWallet/${r.manufacturerAddress}`);
                manufacturerName = res.data.username || r.manufacturerAddress;
                setManufacturerNames(prev => ({ ...prev, [r.manufacturerAddress]: manufacturerName }));
              } catch {
                manufacturerName = r.manufacturerAddress;
              }
            }
            console.log("Request fetched:", r._id, "contractRequestId:", r.contractRequestId);

            return {
              ...r, // keep all original fields including contractRequestId
              manufacturerName,
              contractRequestId: Number(r.contractRequestId) // ensure it's a number
            };
          })
        );

        setRequests(requestsWithNames);
      }
    } catch (err) {
      console.error("Load requests error:", err);
      toast.error("Failed to load requests");
    }
  };

  // ---------------- Handle Approve / Cancel ----------------
  const handleAction = async (request, action) => {
    if (!contract) return toast.error("Contract not loaded!");
    if (!account) return toast.error("Connect wallet first!");

    // Use the blockchain request ID
    const contractRequestId = Number(request.contractRequestId);
    if (!contractRequestId || isNaN(contractRequestId)) {
      return toast.error("Invalid contract request ID!");
    }

    try {
      let tx;
      if (action === "approved") {
        tx = await contract.methods
          .approveRawMaterialRequest(contractRequestId)
          .send({ from: account, gas: 500000 });
      } else if (action === "cancelled") {
        tx = await contract.methods
          .supplierCancelRawMaterialRequest(contractRequestId)
          .send({ from: account, gas: 500000 });
      }

      const txHash = tx.transactionHash;

      // Save/update in MongoDB
      const res = await axios.post(`${url}/api/supplier-approved-requests/action`, {
        requestId: request._id,
        rawId: request.rawId,
        name: request.name,
        quantity: request.quantity,
        price: request.price,
        totalPrice: request.price * request.quantity,
        manufacturerAddress: request.manufacturerAddress,
        manufacturerName: request.manufacturerName,
        supplierId: account,
        supplierName: request.supplierName || "Supplier",
        contractRequestId,
        requestApproveId: request.contractRequestId,
        status: action,
        image: request.image,
        txHash
      });

      if (res.data.success) {
        toast.success(`Request ${action} successfully!`);
        loadRequests();
      } else {
        toast.error("Failed to update request in database");
      }
    } catch (err) {
      console.error("Action error:", err);
      toast.error(`Failed to ${action} request`);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [account]);

  return (
    <div className="manufacturer-requests-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Manufacturer Requests</h2>
      <table className="requests-table">
        <thead>
          <tr>
            <th>Raw ID</th>
            <th>Name</th>
            <th>Quantity</th>
            <th>Price/unit</th>
            <th>Manufacturer</th>
            <th>Status</th>
            <th>Image</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="8">No requests found</td>
            </tr>
          ) : (
            requests.map((r) => (
              <tr key={r._id}>
                <td>{r.rawId}</td>
                <td>{r.name}</td>
                <td>{r.quantity}</td>
                <td>{r.price}</td>
                <td>{r.manufacturerName}</td>
                <td>{r.status}</td>
                <td>{r.image ? <img src={`${url}/raw_uploads/${r.image}`} alt={r.name} height="40" /> : "No Image"}</td>
                <td>
                  {r.status === "pending" ? (
                    <div className="action-buttons">
                      <button className="approve-btn" onClick={() => handleAction(r, "approved")}>Approve</button>
                      <button className="cancel-btn" onClick={() => handleAction(r, "cancelled")}>Cancel</button>
                    </div>
                  ) : r.status}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SupplierRequests;
