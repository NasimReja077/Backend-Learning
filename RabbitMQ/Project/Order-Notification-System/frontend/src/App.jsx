import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

function App() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    customerName: "",
    product: "",
    quantity: 1,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(API_URL);
      setOrders(res.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Auto refresh every 3 seconds to see status change
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(API_URL, {
        customerName: formData.customerName,
        product: formData.product,
        quantity: Number(formData.quantity),
      });

      setMessage("✅ Order created! Notification is being processed...");
      setFormData({ customerName: "", product: "", quantity: 1 });
      fetchOrders();
    } catch (error) {
      setMessage("❌ Failed to create order");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#f59e0b"; // amber
      case "processing":
        return "#3b82f6"; // blue
      case "completed":
        return "#10b981"; // green
      case "failed":
        return "#ef4444"; // red
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="container">
      <h1>🚀 Async Order Notification System</h1>
      <p className="subtitle">MERN + RabbitMQ Learning Project</p>

      {/* Create Order Form */}
      <div className="card">
        <h2>Place New Order</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="Enter customer name"
            />
          </div>

          <div className="form-group">
            <label>Product</label>
            <input
              type="text"
              name="product"
              value={formData.product}
              onChange={handleChange}
              required
              placeholder="e.g. Mechanical Keyboard"
            />
          </div>

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Order"}
          </button>
        </form>

        {message && <p className="message">{message}</p>}
      </div>

      {/* Orders List */}
      <div className="card">
        <h2>Orders List</h2>
        {orders.length === 0 ? (
          <p className="empty">No orders yet. Create one above!</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order._id} className="order-item">
                <div className="order-info">
                  <strong>{order.customerName}</strong>
                  <span>
                    {order.product} × {order.quantity}
                  </span>
                </div>
                <div
                  className="status"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {order.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;