import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Verifications.css";

const Verification = ({ url }) => {
  const [equipmentList, setEquipmentList] = useState([]);

  useEffect(() => {
    const fetchVerifiedEquipment = async () => {
      try {
        const res = await axios.get(`${url}/api/equipment/verified`);
        if (res.data.success) {
          setEquipmentList(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch verified equipment:", err);
      }
    };

    fetchVerifiedEquipment();
  }, [url]);

  return (
    <div className="verification-container">
      <h2>Verified Equipment</h2>

      <table className="verification-table">
        <thead>
          <tr>
            <th>Equipment ID</th>
            <th>Raw Material Request ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Total Price</th>
            <th>Manufacturer Name</th>
            <th>Image</th>
            <th>Registered</th>
            <th>Available</th>
          </tr>
        </thead>

        <tbody>
          {equipmentList.length === 0 ? (
            <tr>
              <td colSpan="10">No verified equipment found</td>
            </tr>
          ) : (
            equipmentList.map((eq) => (
              <tr key={eq._id}>
                <td>{eq.equipmentId}</td>
                <td>{eq.rawMaterialRequestId}</td>
                <td>{eq.name}</td>
                <td>{eq.category}</td>
                <td>{eq.quantity}</td>
                <td>{eq.totalPrice}</td>

                {/* 🔥 FIXED: show manufacturerName instead of wallet */}
                <td>{eq.manufacturerName || "Unknown"}</td>

                {/* 🔥 FIXED: Correct image path */}
                <td>
                  {eq.image ? (
                    <img
                      src={`${url}/uploads/equipment/${eq.image}`}
                      alt={eq.name}
                      height="40"
                    />
                  ) : (
                    "No Image"
                  )}
                </td>

                <td>{eq.registered ? "Yes" : "No"}</td>
                <td>{eq.available ? "Yes" : "No"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Verification;
