import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Package, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function OrdersPage() {
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
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;
    try {
      await axiosClient.post(`/update-order/${orderId}`, { status: 'cancelled' });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
      case 'processing':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><AlertCircle className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Package className="w-7 h-7 text-indigo-600" /> My Orders
      </h1>

      {loading ? (
        <div className="text-center py-20 text-gray-500">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between border-b pb-4 mb-4 gap-2">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Order ID</span>
                  <span className="font-bold text-gray-900">#{order.order_id}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Date</span>
                  <span className="text-sm text-gray-700">{order.order_date ? new Date(order.order_date).toLocaleDateString() : 'Recent'}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider block">Total</span>
                  <span className="text-base font-bold text-indigo-600">${parseFloat(order.total).toFixed(2)}</span>
                </div>
                <div>
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="space-y-2 mb-4">
                  {order.items.map((item) => (
                    <div key={item.order_item_id} className="flex justify-between text-sm">
                      <span className="text-gray-800">{item.product_name} × {item.quantity}</span>
                      <span className="text-gray-600">${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Cancel Button if order is still pending */}
              {order.status === 'pending' && (
                <div className="pt-3 border-t flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(order.order_id)}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 transition"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
