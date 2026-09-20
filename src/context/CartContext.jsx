import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      setCartCount(0);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosClient.get('/cart');
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
        setCartCount(res.data.cart.total_items || 0);
      } else {
        setCart(null);
        setCartCount(0);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      window.location.href = '/login?message=Please login to add items to your cart';
      return;
    }
    const res = await axiosClient.post('/add-cart', {
      product_id: productId,
      quantity,
    });
    await fetchCart();
    return res.data;
  };

  const updateQuantity = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    await axiosClient.post(`/update-cart/${cartItemId}`, { quantity: newQty });
    await fetchCart();
  };

  const removeFromCart = async (cartItemId) => {
    await axiosClient.delete(`/delete-cart/${cartItemId}`);
    await fetchCart();
  };

  const clearCart = async () => {
    await axiosClient.delete('/clear-cart');
    await fetchCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
