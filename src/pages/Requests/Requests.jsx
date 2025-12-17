import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Requests.css";

const Requests = ({ url, contract, account }) => {
  const [equipments, setEquipments] = useState([]);

  // Fetch all equipment
  const fetchEquipments = async () => {
    try {
      const res = await axios.get(`${url}/api/equipment`);
      setEquipments(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  const toggleVerify = async (item) => {
    try {
      if (!account) {
        console.error("Wallet not connected");
        return;
      }

      // 1️⃣ Call smart contract for verification
      const tx = await contract.methods
        .verifyEquipment(item.equipmentId, true)
        .send({ from: account, gas: 500000 });

      const txHash = tx.transactionHash;

      // 2️⃣ Fetch stakeholder name from contract by wallet
      let stakeholderName = "Unknown";
      try {
        const user = await contract.methods.userDetails(account).call();
        stakeholderName = user.name || "Unknown";
      } catch (err) {
        console.warn("Failed to fetch stakeholder name from contract:", err);
      }


      // 3️⃣ Save in stakeholderVerification collection
      await axios.post(`${url}/api/stakeholder-verification/create`, {
        equipmentId: item.equipmentId,
        name: item.name,
        rawMaterialRequestId: item.rawMaterialRequestId,
        manufacturerName: item.manufacturerName,
        category: item.category,
        manufacturerWallet: item.manufacturerWallet,
        stakeholderName,
        stakeholderWallet: account,
        txHash,
      });

      // 4️⃣ Update Equipment verified & available
      const res = await axios.put(`${url}/api/equipment/verify/${item._id}`, {
        verified: true,
      });

      // Update local state
      setEquipments(prev =>
        prev.map(eq => (eq._id === item._id ? res.data.data : eq))
      );

    } catch (err) {
      console.error("Stakeholder verification failed:", err);
    }
  };

  return (
    <div className="requests-container">
      <h2>Equipment Verifications</h2>

      <table className="requests-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Equipment ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Manufacturer</th>
            <th>Verified</th>
            <th>Available</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {equipments.map(item => (
            <tr key={item._id}>
              <td>
                {item.image ? (
                  <img
                    src={`http://localhost:4000/uploads/equipment/${item.image}`}
                    alt={item.name}
                    width="60"
                  />
                ) : (
                  "No Image"
                )}
              </td>

              <td>{item.equipmentId}</td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.manufacturerName || "Unknown"}</td>
              <td>{item.verified ? "Yes" : "No"}</td>
              <td>{item.available ? "Yes" : "No"}</td>

              <td>
                <button
                  className={`verify-btn ${item.verified ? "unverify" : "verify"}`}
                  onClick={() => toggleVerify(item)}
                  disabled={item.verified} // disable if already verified
                >
                  {item.verified ? "Verified" : "Verify"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Requests;
