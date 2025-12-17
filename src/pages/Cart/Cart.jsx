import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Cart.css";

const Cart = ({ account, contract, url }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialItems = location.state?.items || []; // items from AvailableEquipment
  const userFromState = location.state?.user || null; // logged-in user

  const [cartItems, setCartItems] = useState(initialItems);
  const [user] = useState(userFromState);

  // Remove item from cart
  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.equipmentId !== id));
    toast.info("Item removed from cart");
  };

  // Total price
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Place order
  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error("Please log in to place an order.");
      return;
    }

    if (!account || !contract) {
      toast.error("Connect your wallet first!");
      return;
    }

    const orderId = Math.floor(Math.random() * 1000000);
    try {
      // 1️⃣ Send order to smart contract for each item
      for (const item of cartItems) {
        const isAvailable = await contract.methods
          .isEquipmentAvailableForOrder(item.equipmentId)
          .call();

        if (!isAvailable) {
          toast.error(`Equipment ${item.name} is not available`);
          return;
        }

        const tx = await contract.methods
          .orderEquipment(item.equipmentId, item.quantity)
          .send({ from: account, gas: 300000 });

        item.txHash = tx.transactionHash; // store tx hash
      }

      // 2️⃣ Save order to backend
      const orderData = {
        orderId,
        user: {
          name: user.name,
          email: user.email,
          contact: user.contact,
          userAddress: user.userAddress,
          walletAddress: account,
        },
        items: cartItems.map((item) => ({
          equipmentId: item.equipmentId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          txHash: item.txHash,
        })),
        totalPrice,
        shipped: false,
        delivered: false,
        orderDate: new Date().toISOString(),
      };

      await axios.post(`http://localhost:4000/api/orders`, orderData);

      toast.success("Order placed successfully!");
      navigate("/order", { state: { order: orderData } });
    } catch (err) {
      console.error("Failed to place order:", err);
      toast.error("Failed to place order. Check console for details.");
    }
  };

  return (
    <div className="cart-container">
      <ToastContainer position="top-right" autoClose={3000} />

      <h2>Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div className="cart-grid">
          {/* Cart Items */}
          <div className="cart-items">
            {cartItems.map((item) => (
              <div className="cart-item" key={item.equipmentId}>
                {item.image && (
                  <img
                    src={`http://localhost:4000/uploads/equipment/${item.image}`}
                    alt={item.name}
                    className="cart-item-image"
                  />
                )}
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p><strong>Equipment ID:</strong> {item.equipmentId}</p>
                  <p><strong>Price:</strong> ${item.price}</p>
                  <p><strong>Quantity:</strong> {item.quantity}</p>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.equipmentId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3>User Details</h3>
            <p><strong>Name:</strong> {user?.name || "N/A"}</p>
            <p><strong>Address:</strong> {user?.userAddress || "N/A"}</p>
            <p><strong>Phone:</strong> {user?.contact || "N/A"}</p>
            <p><strong>Email:</strong> {user?.email || "N/A"}</p>
            <p><strong>Order Date:</strong> {new Date().toLocaleString()}</p>

            <h3>Total: ${totalPrice}</h3>
            <button className="place-order-btn" onClick={handlePlaceOrder}>
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
