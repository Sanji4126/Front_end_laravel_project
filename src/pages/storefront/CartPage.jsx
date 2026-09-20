import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();

  const items = cart?.cart_items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const shipping = subtotal > 0 ? 15.0 : 0.0;
  const total = subtotal + shipping;

  if (loading) {
    return <div className="text-center py-20">Loading cart...</div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.cart_item_id}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
            >
              <img
                src={item.product?.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=60'}
                alt={item.product?.pro_name || item.product?.product_name}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200&auto=format&fit=crop&q=60';
                }}
                className="w-20 h-20 object-cover rounded-lg bg-gray-100"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {item.product?.pro_name || item.product?.product_name}
                </h3>
                <p className="text-sm text-indigo-600 font-bold">
                  ${parseFloat(item.product?.price || 0).toFixed(2)}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="p-1.5 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-gray-800">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                  className="p-1.5 text-gray-500 hover:text-gray-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right">
                <div className="font-bold text-gray-900">
                  ${(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.cart_item_id)}
                  className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 justify-end"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-base text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow transition"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
