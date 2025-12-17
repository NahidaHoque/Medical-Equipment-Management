import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Transporter.css";

const Transporter = ({ account, contract, url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/orders`);
      if (res.data.success) {
        setOrders(res.data.data);
      } else {
        setOrders([]);
        console.error("Failed to fetch orders");
      }
    } catch (err) {
      setOrders([]);
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  // Mark order as shipped
  const markShipped = async (order) => {
    if (!account || !contract) {
      toast.warning("Connect your wallet first!");
      return;
    }

    try {
      // 1️⃣ Mark shipped on blockchain
      const tx = await contract.methods
        .shipEquipment(order.orderId)
        .send({ from: account, gas: 300000 });

      const txHash = tx.transactionHash;
      toast.success("Order marked as shipped on blockchain!");

      // 2️⃣ Get transporter name from contract
      let transporterName = "Unknown";
      try {
        const user = await contract.methods.userDetails(account).call();
        transporterName = user.name || "Unknown";
      } catch (err) {
        console.warn("Failed to fetch transporter name from contract:", err);
      }

      // 3️⃣ Save transporter order info to backend
      for (const item of order.items) {
        await axios.post(`http://localhost:4000/api/transporter-orders/create`, {
          orderId: order.orderId,
          orderDate: order.orderDate,
          txHash,
          hospitalName: order.user.name,
          hospitalWallet: order.user.walletAddress,
          equipmentId: item.equipmentId,
          equipmentName: item.name,
          transporterName,
          transporterWallet: account,
        });
      }

      // 4️⃣ Update backend orders as shipped
      await axios.put(`http://localhost:4000/api/orders/ship/${order._id}`, {
        role: "transporter",
        txHash,
      });

      fetchOrders(); // refresh orders
      toast.success("Transporter order info saved successfully!");
    } catch (err) {
      console.error("Error marking order as shipped:", err);
      toast.error("Failed to mark order as shipped. Check console.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (orders.length === 0) return <p>No orders found.</p>;

  return (
    <div className="order-container">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2>Transporter Shipment Management</h2>
      <table className="order-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Order Date</th>
            <th>Hospital</th>
            <th>Contact</th>
            <th>Total Price</th>
            <th>Status</th>
            <th>Items</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{new Date(order.orderDate).toLocaleString()}</td>
              <td>
                <strong>{order.user.name}</strong>
                <br />
                {order.user.email}
                <br />
                {order.user.userAddress}
              </td>
              <td>{order.user.contact}</td>
              <td>${order.totalPrice}</td>
              <td>
                <span className={order.shipped ? "status shipped" : "status pending"}>
                  {order.shipped ? "Shipped ✔" : "Pending ❌"}
                </span>
              </td>
              <td>
                <table className="nested-table">
                  <thead>
                    <tr>
                      <th>Img</th>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Qty</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.equipmentId}>
                        <td>
                          {item.image && (
                            <img
                              src={`${url}/uploads/equipment/${item.image}`}
                              alt={item.name}
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          )}
                        </td>
                        <td>{item.equipmentId}</td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>${item.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </td>
              <td>
                <button
                  className="ship-btn"
                  disabled={order.shipped}
                  onClick={() => markShipped(order)}
                >
                  {order.shipped ? "Shipped" : "Mark Shipped"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Transporter;
