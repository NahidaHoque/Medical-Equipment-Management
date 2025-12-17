import React, { useEffect, useState } from "react";
import "./Prediction.css";

const getMaxDays = (month) => {
  if (month === 2) return 28;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
};

const Prediction = () => {
  const [hospital, setHospital] = useState(""); // email
  const [hospitals, setHospitals] = useState([]);
  const [equipmentNames, setEquipmentNames] = useState([]);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch hospitals
  useEffect(() => {
    fetch("http://localhost:4000/api/user/all")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHospitals(data.data.filter((u) => u.role === "hospital"));
        }
      });
  }, []);

  // 🔹 Fetch equipment names
  useEffect(() => {
    fetch("http://localhost:4000/api/equipment/names")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setEquipmentNames(data.data);
      });
  }, []);

  // 🔄 Month correction
  const onMonthChange = (e) => {
    let value = Number(e.target.value);
    if (!value) return setMonth("");
    if (value < 1) value = 1;
    if (value > 12) value = 12;
    setMonth(value);
    if (day > getMaxDays(value)) setDay(getMaxDays(value));
  };

  // 🔄 Day correction
  const onDayChange = (e) => {
    let value = Number(e.target.value);
    if (!value) return setDay("");
    const max = month ? getMaxDays(month) : 31;
    if (value < 1) value = 1;
    if (value > max) value = max;
    setDay(value);
  };

  // 🔄 Year correction
  const onYearChange = (e) => {
    let value = Number(e.target.value);
    if (!value) return setYear("");
    if (value < 2000) value = 2000;
    if (value > 2025) value = 2025;
    setYear(value);
  };

  // 🚀 PREDICT (API LOOP)
    const handlePredict = async () => {
    if (!hospital || !day || !month || !year) return;

    setLoading(true);
    const predictions = [];

    for (const equipment of equipmentNames) {
        try {
        const response = await fetch(
            `http://192.168.0.58:5000/predict?email=${encodeURIComponent(
            hospital
            )}&equipment_name=${encodeURIComponent(
            equipment
            )}&Day=${day}&Month=${month}&Year=${year}`
        );

        const data = await response.json();

        predictions.push({
            name: equipment,
            quantity: data.result, // ✅ CORRECT
        });
        } catch (error) {
        predictions.push({
            name: equipment,
            quantity: 0,
        });
        }
    }

    setResult(predictions);
    setLoading(false);
    };

  return (
    <div className="prediction-container">
      <h2>📊 Equipment Demand Prediction</h2>

      <div className="prediction-form">
        <div className="form-group">
          <label>Select Hospital</label>
          <select value={hospital} onChange={(e) => setHospital(e.target.value)}>
            <option value="">-- Select Hospital --</option>
            {hospitals.map((h) => (
              <option key={h._id} value={h.email}>
                {h.name}
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
        <div className="prediction-result">
          <h3>Predicted Equipment Demand</h3>
          <table>
            <thead>
              <tr>
                <th>Equipment Name</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {result.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Prediction;
