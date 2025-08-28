import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [noUser, setNoUser] = useState(false);
  useEffect(() => {
    // Fetch user's orders from backend (replace with actual user_id logic)
    const user_id = localStorage.getItem('user_id');
    if (!user_id) {
      setNoUser(true);
      setLoading(false);
      return;
    }
  fetch(`https://kiitsaathi-3.onrender.com/orders?user_id=${user_id}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch orders');
        return res.json();
      })
      .then(data => {
        console.log('Fetched orders:', data.orders);
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Orders fetch error:', err);
        setOrders([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800">
      <div className="max-w-3xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6 text-blue-700">My Purchased Services</h1>
        {loading ? (
          <div className="text-center text-blue-500">Loading...</div>
        ) : noUser ? (
          <div className="text-center text-red-500">You must be logged in to view your orders.</div>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500">No orders found.</div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-4 border border-blue-100">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-blue-700">{order.service_name}</div>
                    <div className="text-sm text-gray-500">{order.subservice_name}</div>
                  </div>
                  <div className="text-lg font-bold text-green-600">₹{order.amount}</div>
                </div>
                <div className="mt-2 text-xs text-gray-400">Order ID: {order.transaction_id}</div>
                <div className="mt-1 text-xs text-gray-400">Status: {order.payment_status}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
