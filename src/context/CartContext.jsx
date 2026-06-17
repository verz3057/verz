import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  // Fetch cart from backend on login
  useEffect(() => {
    if (user) {
      fetchCartFromBackend();
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [user]);

  const fetchCartFromBackend = async () => {
    setCartLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setCartItems(prev => {
          if (prev.length === 0) return data;
          
          const merged = [...data];
          prev.forEach(guestItem => {
            const existingInDB = merged.find(dbItem => dbItem.id === guestItem.id);
            if (existingInDB) {
              existingInDB.quantity += guestItem.quantity;
            } else {
              merged.push(guestItem);
            }
          });
          return merged;
        });
        setHasFetched(true);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setHasFetched(true);
    } finally {
      setCartLoading(false);
    }
  };

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Sync with backend if logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && hasFetched) {
      syncCartToBackend(cartItems);
    }
  }, [cartItems, hasFetched]);

  const syncCartToBackend = async (cart) => {
    if (!user) return;
    try {
      // With Supabase, we either sync line by line, or store as JSON.
      // Since schema uses a table `cart_items` with (user_id, product_id, quantity),
      // we can delete all for this user and insert new, or use upsert.
      // For a quick migration keeping UI intact, let's delete and insert:
      await supabase.from('cart_items').delete().eq('user_id', user.id);
      if (cart.length > 0) {
        const payload = cart.map(item => ({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity,
          price_at_time: item.price
        }));
        await supabase.from('cart_items').insert(payload);
      }
    } catch (err) {
      console.error('Failed to sync cart:', err);
    }
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  );
};
