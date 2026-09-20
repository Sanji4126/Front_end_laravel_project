import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../context/CartContext';
import { CreditCard, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, fetchCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [submitting, setSubmitting] = useState(false);

  const subtotal = parseFloat(cart?.subtotal || 0);
  const shippingFee = 15.0;
  const discount = 0.0;
  const total = subtotal + shippingFee - discount;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      // Checkout from Cart via Backend /add-order
      const orderRes = await axiosClient.post('/add-order', {
        shipping_fee: shippingFee,
        discount: discount,
        payment_method: paymentMethod,
      });

      const order = orderRes.data.order;

      // Automatically submit payment for credit_card if selected
      if (paymentMethod === 'credit_card' && order?.order_id) {
        await axiosClient.post('/add-payment', {
          order_id: order.order_id,
          payment_method: 'credit_card',
          amount: total,
        });
      }

      await fetchCart(); // Clears frontend cart badge
      navigate('/orders?success=1');
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Payment and Delivery Options */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              Select Payment Method
            </h2>
            <div className="space-y-3">
              {[
                { id: 'credit_card', label: 'Credit Card / Visa / MasterCard' },
                { id: 'cash', label: 'Cash on Delivery (COD)' },
                { id: 'aba_pay', label: 'ABA Pay / KHQR' },
              ].map((m) => (
                <label
                  key={m.id}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition ${
                    paymentMethod === m.id
                      ? 'border-indigo-600 bg-indigo-50/50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-800">{m.label}</span>
                  </div>
                  {paymentMethod === m.id && (
                    <CheckCircle className="w-5 h-5 text-indigo-600" />
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Total Cost Column */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 h-fit space-y-4">
          <h2 className="font-bold text-gray-900 text-lg">Order Total</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Cart Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-base text-gray-900">
              <span>Final Total</span>
              <span className="text-indigo-600">${total.toFixed(2)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
          </button>
        </div>

      </form>
    </div>
  );
}
