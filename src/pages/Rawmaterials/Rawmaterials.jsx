import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Rawmaterials.css";

const RawMaterials = ({ contract, account, url }) => {
  const [materials, setMaterials] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Metals");
  const [image, setImage] = useState(null);

  const loadMaterials = async () => {
  try {
    const res = await axios.get(`${url}/api/raw`); 
    setMaterials(res.data); 
  } catch (err) {
    console.error(err);
    toast.error("Error loading raw materials from database");
  }
};


  
  // ADD MATERIAL
  

// Inside your addMaterial function
    const addMaterial = async () => {
      if (!account) return toast.error("Connect your wallet first!");

      if (!name || !quantity || !price || !category || !image) {
        return toast.error("Please fill all fields!");
      }

      if (Number(quantity) <= 0 || Number(price) <= 0) {
        return toast.error("Quantity and Price must be greater than 0");
      }

      try {
        const normalizedAccount = account.toLowerCase();

        // Check supplier status
        const isSupplier = await contract.methods.suppliers(normalizedAccount).call();
        if (!isSupplier) return toast.error("Your account is not registered as a supplier!");

        // Blockchain transaction - FIXED VERSION
        const tx = await contract.methods
          .createRawMaterial(name, quantity, price, category)
          .send({ from: normalizedAccount, gas: 300000 });

        const rawIdStr = await contract.methods.rawMaterialCount().call();
        const rawId = Number(rawIdStr);

        // Save to backend
        const formData = new FormData();
        formData.append("name", name);
        formData.append("quantity", quantity);
        formData.append("price", price);
        formData.append("category", category);
        formData.append("supplier", normalizedAccount);
        formData.append("rawId", rawId);
        formData.append("image", image);
        formData.append("txHash", tx.transactionHash);

        await axios.post(`${url}/api/raw`, formData);

        setName("");
        setQuantity("");
        setPrice("");
        setCategory("Metals");
        setImage(null);

        loadMaterials();
        toast.success("Raw material added successfully!");
      } catch (err) {
        console.error("Error adding raw material:", err);
        toast.error("Error adding raw material. Check console for details.");
      }
    };



  useEffect(() => {
    loadMaterials();
  }, [contract]);

  
  // UI
 

  return (
    <div className="raw-materials-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2>Producer - Raw Materials</h2>

      <div className="raw-material-form">

        <input
          type="text"
          placeholder="Raw material name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Quantity (units)"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price per unit"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        {/* Auto calculation preview */}
        {quantity && price ? (
          <p style={{ color: "green", fontWeight: "bold" }}>
            Total stock value: {Number(quantity) * Number(price)} taka
          </p>
        ) : null}

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="Metals">Metals</option>
          <option value="Plastics and Polymers">Plastics and Polymers</option>
          <option value="Electronics">Electronics</option>
          <option value="Glass">Glass</option>
          <option value="Others">Others</option>
        </select>

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button onClick={addMaterial}>Add Raw Material</button>
      </div>


      <h3>Your Raw Materials</h3>

      <table className="raw-material-list">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Category</th>
            <th>Image</th>
          </tr>
        </thead>

        <tbody>
          {materials.map((m) => (
            <tr key={m.id}>
              <td>{m.rawId}</td>
              <td>{m.name}</td>
              <td>{m.quantity}</td>
              <td>{m.price || "N/A"}</td>
              <td>{m.category || "N/A"}</td>
              <td>
                {m.image ? (
                  <img
                    src={`${url}/raw_uploads/${m.image}`}
                    height="40"
                    alt={m.name}
                  />
                ) : (
                  "No Image"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RawMaterials;
