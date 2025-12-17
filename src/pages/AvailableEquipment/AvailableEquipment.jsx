import React, { useEffect, useState } from "react";
import axios from "axios";
import ExploreEquipment from "../../components/ExploreEquipment/ExploreEquipment";
import "./AvailableEquipment.css";
import { useNavigate } from "react-router-dom";

const AvailableEquipment = ({ url, user }) => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [quantities, setQuantities] = useState({}); // track user-selected quantities
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableEquipment = async () => {
      try {
        const res = await axios.get(`${url}/api/equipment`);
        if (res.data.success) {
          const availableItems = res.data.data.filter(
            (eq) => eq.verified && eq.available
          );
          setEquipmentList(availableItems);

          // Initialize default quantities to 1
          const defaultQuantities = {};
          availableItems.forEach((eq) => {
            defaultQuantities[eq._id] = 1;
          });
          setQuantities(defaultQuantities);
        }
      } catch (err) {
        console.error("Failed to fetch available equipment:", err);
      }
    };

    fetchAvailableEquipment();
  }, [url]);

  // Handle quantity input changes
  const handleQuantityChange = (id, value) => {
    const equipment = equipmentList.find((eq) => eq._id === id);
    if (!equipment) return;

    let intVal = parseInt(value);
    if (isNaN(intVal) || intVal < 1) intVal = 1;
    if (intVal > equipment.quantity) intVal = equipment.quantity;

    setQuantities((prev) => ({ ...prev, [id]: intVal }));
  };

  // Handle "Order Now" click
  const handleOrder = (equipment) => {
    if (!user) {
      alert("Please log in to place an order.");
      return;
    }

    const quantity = quantities[equipment._id] || 1;
    const itemWithQuantity = { ...equipment, quantity };

    navigate("/cart", { state: { items: [itemWithQuantity], user } });
  };

  return (
    <div className="available-container">
      {/* Explore Equipment Slider */}
      <ExploreEquipment />

      <h2 className="avail">Available Equipment for Hospitals</h2>

      <div className="equipment-grid">
        {equipmentList.length === 0 ? (
          <p>No equipment available at the moment.</p>
        ) : (
          equipmentList.map((eq) => (
            <div className="equipment-card" key={eq._id}>
              {eq.image && (
                <img
                  src={`${url}/uploads/equipment/${eq.image}`}
                  alt={eq.name}
                  className="equipment-image"
                />
              )}

              <div className="equipment-info">
                <h3>{eq.name}</h3>
                <p><strong>Category:</strong> {eq.category}</p>
                <p><strong>Price:</strong> ${eq.price}</p>
                <p><strong>Available Quantity:</strong> {eq.quantity}</p>

                <label>
                  Order Quantity:
                  <input
                    type="number"
                    min="1"
                    max={eq.quantity}
                    value={quantities[eq._id] || 1}
                    onChange={(e) => handleQuantityChange(eq._id, e.target.value)}
                  />
                </label>

                <button
                  className="order-btn"
                  onClick={() => handleOrder(eq)}
                >
                  Order Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AvailableEquipment;
