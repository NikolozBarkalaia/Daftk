import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { getMediaUrl } from '../services/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    const updated = cartItems.map(item =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const removeItem = (id) => {
    const updated = cartItems.filter(item => item._id !== id);
    setCartItems(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 0; // Complimentary shipping
  const total = subtotal + shipping;

  return (
    <div className="container pb-20">
      <h1 className="page-title">Your Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-dark mb-4">Your cart is empty</p>
          <Link to="/shop" className="btn">Continue Shopping</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                <table className="cart-table w-full">
                  <thead className="bg-gray-light border-b border-border">
                    <tr>
                      <th className="p-4 text-left">Product</th>
                      <th className="p-4 text-center">Price</th>
                      <th className="p-4 text-center">Quantity</th>
                      <th className="p-4 text-right">Total</th>
                      <th className="p-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item._id} className="border-b border-border hover:bg-gray-light transition-colors">
                        <td className="p-4">
                          <div className="flex gap-3 items-start">
                            {item.image && (
                              <img
                                src={getMediaUrl(item.image)}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                            )}
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <Link 
                                to={`/product/${item._id}`}
                                className="text-sm text-gray-dark hover:underline"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">€{item.price}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2 border border-border rounded w-fit mx-auto">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-light"
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val > 0) updateQuantity(item._id, val);
                              }}
                              className="w-10 text-center border-none outline-none"
                              min="1"
                            />
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-light"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right font-medium">€{(item.price * item.quantity).toFixed(2)}</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => removeItem(item._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Remove from cart"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={clearCart}
                className="btn-outline mt-4"
              >
                Clear Cart
              </button>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-light p-6 rounded-lg border border-border sticky top-24">
                <h3 className="text-lg font-serif font-bold mb-6">Order Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-dark">Subtotal</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-dark">Shipping</span>
                    <span className="text-green-600 font-medium">Complimentary</span>
                  </div>
                  <div className="h-px bg-border"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <button className="btn w-full mb-3">
                  Proceed to Checkout
                </button>

                <Link to="/shop" className="btn-outline block text-center">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
