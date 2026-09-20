import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { DollarSign, CreditCard } from 'lucide-react';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get('/payments');
      setPayments(res.data?.payments || res.data?.payment || []);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Transactions</h1>
        <p className="text-sm text-gray-500">History of customer payments and transaction records</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
              <tr>
                <th className="p-4">Payment #</th>
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.map((pay) => (
                <tr key={pay.payment_id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-mono text-gray-500 text-xs">#{pay.payment_id}</td>
                  <td className="p-4 font-bold text-gray-900">#{pay.order_id}</td>
                  <td className="p-4 text-gray-700">
                    {pay.order?.user?.user_name || pay.order?.user?.name || `User #${pay.order?.user_id || 'N/A'}`}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      <CreditCard className="w-3.5 h-3.5" />
                      {pay.payment_method?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">
                    ${parseFloat(pay.amount || 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {pay.payment_date ? new Date(pay.payment_date).toLocaleString() : 'Recent'}
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
