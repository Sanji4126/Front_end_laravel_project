import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { ShoppingCart } from 'lucide-react';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.post(`/update-order/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.error || 'Status update failed');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customer Orders Processing</h1>
        <p className="text-sm text-gray-500">Track and update customer order fulfillment status</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <ShoppingCart className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No orders received yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer ID</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((o) => (
                <tr key={o.order_id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">#{o.order_id}</td>
                  <td className="p-4 text-gray-600">User ID: {o.user_id}</td>
                  <td className="p-4 font-bold text-indigo-600">${parseFloat(o.total).toFixed(2)}</td>
                  <td className="p-4">
                    <span
                      className={`capitalize px-2.5 py-1 rounded-full text-xs font-semibold ${
                        o.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : o.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : o.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateStatus(o.order_id, e.target.value)}
                      className="border rounded-lg p-1.5 text-xs bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled (Restock)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
