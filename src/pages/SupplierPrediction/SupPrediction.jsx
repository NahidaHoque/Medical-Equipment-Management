import React, { useEffect, useState } from "react";
import "./SupPrediction.css";

const getMaxDays = (month) => {
  if (month === 2) return 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
};

const SupPrediction = ({ user, contract, account, url }) => {
  // 🔐 supplier email hidden
  const [supplierEmail, setSupplierEmail] = useState("");

  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturer, setManufacturer] = useState("");
  const [rawMaterials, setRawMaterials] = useState([]);
  const [result, setResult] = useState(null);

  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    const fetchSupplierEmailFromChain = async () => {
      if (!contract || !account) return;

      try {
        const userInfo = await contract.methods.userDetails(account).call();

        // userInfo.emailId comes from Solidity
        if (userInfo && userInfo.emailId) {
          setSupplierEmail(userInfo.emailId);
        }
      } catch (err) {
        console.error("Failed to fetch supplier email from contract:", err);
      }
    };

    fetchSupplierEmailFromChain();
  }, [contract, account]);



  // 🔹 Fetch manufacturers
  useEffect(() => {
    fetch("http://localhost:4000/api/user/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setManufacturers(
            data.data.filter((u) => u.role === "manufacturer")
          );
        }
      });
  }, []);

  // 🔹 Fetch available raw materials
  useEffect(() => {
    fetch("http://localhost:4000/api/raw/all")
      .then((res) => res.json())
      .then((data) => {
        console.log("RAW MATERIAL API RESPONSE:", data);
        setRawMaterials(data);
      });
  }, []);

  // 🔄 Date corrections
  const onMonthChange = (e) => {
    let v = Number(e.target.value);
    if (!v) return setMonth("");
    if (v < 1) v = 1;
    if (v > 12) v = 12;
    setMonth(v);
    if (day > getMaxDays(v)) setDay(getMaxDays(v));
  };

  const onDayChange = (e) => {
    let v = Number(e.target.value);
    if (!v) return setDay("");
    const max = month ? getMaxDays(month) : 31;
    if (v < 1) v = 1;
    if (v > max) v = max;
    setDay(v);
  };

  const onYearChange = (e) => {
    let v = Number(e.target.value);
    if (!v) return setYear("");
    if (v < 2000) v = 2000;
    if (v > 2025) v = 2025;
    setYear(v);
  };

  // 🚀 Predict (frontend display)
  // 🚀 Predict (REAL ML API)
  // console.log("SUPPLIER EMAIL SENT:", supplierEmail);
  const handlePredict = async () => {
    if (!supplierEmail || !manufacturer || !day || !month || !year) return;

    setLoading(true);
    const predictions = [];

    for (const material of rawMaterials) {
      try {
        const response = await fetch(
          `http://192.168.0.58:5001/predict` +
            `?supplier_email=${encodeURIComponent(supplierEmail)}` +
            `&manufacturer_email=${encodeURIComponent(manufacturer)}` +
            `&raw_material_name=${encodeURIComponent(material.name)}` +
            `&day=${day}&month=${month}&year=${year}`
        );

        const data = await response.json();

        predictions.push({
          name: material.name,
          quantity: data.result ?? 0, // ML predicted quantity
        });
      } catch (err) {
        predictions.push({
          name: material.name,
          quantity: 0,
        });
      }
    }

    setResult(predictions);
    setLoading(false);
  };

  return (
    <div className="sup-prediction-container">
      <h2>📦 Raw Material Demand Prediction</h2>

      <div className="sup-form">
        <div className="form-group">
          <label>Select Manufacturer</label>
          <select
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
          >
            <option value="">-- Select Manufacturer --</option>
            {manufacturers.map((m) => (
              <option key={m._id} value={m.email}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="date-group">
          <div className="form-group">
            <label>Day</label>
            <input type="number" value={day} onChange={onDayChange} />
          </div>

          <div className="form-group">
            <label>Month</label>
            <input type="number" value={month} onChange={onMonthChange} />
          </div>

          <div className="form-group">
            <label>Year</label>
            <input type="number" value={year} onChange={onYearChange} />
          </div>
        </div>

        <button className="predict-btn" onClick={handlePredict} disabled={loading}>
          {loading ? "Predicting..." : "Predict"}
        </button>
      </div>

      {result && (
        <div className="sup-result">
          <h3>Available Raw Materials</h3>
          <table>
            <thead>
              <tr>
                <th>Material Name</th>
                <th>Available Quantity</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{r.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupPrediction;
