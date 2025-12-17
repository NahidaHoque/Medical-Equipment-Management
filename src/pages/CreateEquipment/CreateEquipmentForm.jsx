import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CreateEquipment.css";

const CreateEquipmentForm = ({ contract, account, user, url }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  const rawMaterialRequestId = data.rawMaterialRequestId || "";
  const rawId = data.rawId || "";
  const rawName = data.rawName || "";
  const availableQuantity = data.rawQuantity || 0;
  const supplierName = data.supplierName || "Unknown";
  const supplierWallet = data.supplierWallet || "";
  const manufacturerName = data.manufacturerName || "Manufacturer";

  const [equipmentName, setEquipmentName] = useState("");
  const [unitPrice, setUnitPrice] = useState(0);
  const [rawUnitsPerEquipment, setRawUnitsPerEquipment] = useState(1);
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [maxEquipments, setMaxEquipments] = useState(
    Math.floor(availableQuantity / rawUnitsPerEquipment)
  );

  const manufacturerAddress = user?.wallet || account;

  useEffect(() => {
    const units = Number(rawUnitsPerEquipment);
    if (!units || units <= 0) return setMaxEquipments(0);
    setMaxEquipments(Math.floor(availableQuantity / units));
  }, [rawUnitsPerEquipment, availableQuantity]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!manufacturerAddress) return toast.error("Wallet not connected!");
  if (!contract) return toast.error("Smart contract not loaded!");
  if (!equipmentName || !unitPrice || !rawUnitsPerEquipment || !category)
    return toast.error("Please fill all fields");
  if (Number(rawUnitsPerEquipment) > availableQuantity)
    return toast.error("Required raw units exceed available quantity");

  try {
    // ================= Smart Contract Transaction =================
    const tx = await contract.methods
      .createEquipment(
        equipmentName,                    // _name
        Number(rawMaterialRequestId),     // _rawMaterialRequestId
        Number(unitPrice),                // _price
        category,                         // _category
        true                              // _register
      )
      .send({ from: manufacturerAddress, gas: 500000 });

    const txHash = tx.transactionHash;

    // ================= Save to Backend =================
    const formData = new FormData();
    //formData.append("equipmentId", tx.events?.EquipmentCreated?.returnValues?.equipmentId || ""); // optional if event not emitted
    formData.append("rawMaterialRequestId", rawMaterialRequestId);
    formData.append("name", equipmentName);
    formData.append("price", Number(unitPrice));
    formData.append("quantity", Number(rawUnitsPerEquipment));
    formData.append(
      "totalPrice",
      Number(unitPrice) * Number(rawUnitsPerEquipment)
    );
    formData.append("category", category);
    formData.append("manufacturerWallet", manufacturerAddress); // renamed
    formData.append("manufacturerName", manufacturerName);
    formData.append("supplierName", supplierName);
    //formData.append("supplierWallet", supplierWallet);           // ensure this exists
    formData.append("txHash", txHash);
    formData.append("registered", "true");
    formData.append("verified", "false");
    formData.append("available", "false");
    if (image) formData.append("image", image);

    // =============== DEBUG LOG =================
    console.log("===== FormData to POST =====");
    for (let pair of formData.entries()) {
      console.log(pair[0], ":", pair[1]);
    }
    console.log("============================");

    await axios.post(`${url}/api/equipment/create`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Equipment created successfully!");

    // ================= Update Used Quantity =================
    await axios.post(`${url}/api/supplier-approved-requests/update-used`, {
      requestId: rawMaterialRequestId,
      usedQuantity: Number(rawUnitsPerEquipment),
    });

    toast.success("Equipment created successfully!");
    navigate("/manufacturer/supplier-approved-requests");
  } catch (err) {
    console.error("Create equipment failed:", err);
    toast.error("Error creating equipment. Check console.");
  }
};


  return (
    <div className="page-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Create Equipment</h2>

      {!manufacturerAddress || !contract ? (
        <p style={{ color: "red", padding: 20 }}>
          Connect your wallet to create equipment.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="equipment-form">
          <label>Raw Material Request ID</label>
          <input value={rawMaterialRequestId} disabled />

          <label>Raw Material ID</label>
          <input value={rawId} disabled />

          <label>Raw Material Name</label>
          <input value={rawName} disabled />

          <label>Supplier Name</label>
          <input value={supplierName} disabled />

          <label>Manufacturer Name</label>
          <input value={manufacturerName} disabled />

          <label>Available Quantity</label>
          <input value={availableQuantity} disabled />

          <label>Equipment Name</label>
          <input
            value={equipmentName}
            onChange={(e) => setEquipmentName(e.target.value)}
            required
          />

          <label>Price per Unit</label>
          <input
            type="number"
            value={unitPrice}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            min="1"
            required
          />

          <label>Raw Units per Equipment</label>
          <input
            type="number"
            value={rawUnitsPerEquipment}
            onChange={(e) => setRawUnitsPerEquipment(Number(e.target.value))}
            min="1"
            max={availableQuantity}
            required
          />

          <label>Max Equipments You Can Produce</label>
          <input value={maxEquipments} disabled />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Respiratory">Respiratory</option>
            <option value="Emergency">Emergency</option>
            <option value="Diagnostics">Diagnostics</option>
            <option value="Consumables">Consumables</option>
            <option value="Therapy">Therapy</option>
            <option value="Surgical">Surgical</option>
            <option value="Mobility">Mobility</option>
          </select>

          <label>Equipment Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          <button
            type="submit"
            className="submit-btn"
            disabled={Number(rawUnitsPerEquipment) > availableQuantity}
          >
            Create Equipment
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateEquipmentForm;
