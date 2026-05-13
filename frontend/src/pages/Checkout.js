import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Lock, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createOrder, getMediaUrl } from '../services/api';

const ORDERS_KEY = 'daftk_orders';

// Only persist the token — full data is always fetched fresh from the backend
const saveOrderToken = (token) => {
  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    // Handle legacy format (array of full order objects)
    const tokens = existing.map((e) => (typeof e === 'string' ? e : e.token)).filter(Boolean);
    if (!tokens.includes(token)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify([token, ...tokens]));
    }
  } catch {}
};

/* ─── Field Component ─────────────────────────────────────── */
const Field = ({ label, name, value, onChange, type = 'text', required, placeholder }) => (
  <div className="checkout-field">
    <label className="checkout-field__label" htmlFor={name}>
      {label}{required && <span className="checkout-field__req">*</span>}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      className="input-field checkout-field__input"
      autoComplete="on"
    />
  </div>
);

/* ─── Checkout Page ───────────────────────────────────────── */
const Checkout = () => {
  const { cartItems, cartSubtotal, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (cartItems.length === 0) {
    return (
      <div className="container pb-20">
        <div className="cart-empty">
          <div className="cart-empty__icon"><ShoppingBag size={64} strokeWidth={0.8} /></div>
          <h2 className="cart-empty__title">Your bag is empty</h2>
          <Link to="/shop" className="btn cart-empty__cta">Explore Collection</Link>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const shippingAddress = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      country: form.country,
      postalCode: form.postalCode,
    };

    const items = cartItems.map((item) => ({
      _id: item._id,
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      selectedSize: item.selectedSize,
    }));

    try {
      const { data } = await createOrder({
        items,
        shippingAddress,
        subtotal: cartSubtotal,
        total: cartSubtotal,
        notes: form.notes,
      });
      saveOrderToken(data.token);
      clearCart();
      navigate(`/order-confirmation/${data.token}`, { state: { order: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="container pb-20">
      <div className="checkout-header">
        <h1 className="checkout-header__title">Checkout</h1>
        <p className="checkout-header__sub">{cartCount} {cartCount === 1 ? 'item' : 'items'}</p>
      </div>

      <div className="checkout-layout">
        {/* ── Left: shipping form ── */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <section className="checkout-section">
            <h2 className="checkout-section__title">Delivery Information</h2>

            <div className="checkout-row">
              <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Jean" />
              <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Dupont" />
            </div>
            <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+33 6 00 00 00 00" />
            <Field label="Street Address" name="address" value={form.address} onChange={handleChange} required placeholder="12 Rue de la Paix" />
            <div className="checkout-row">
              <Field label="City" name="city" value={form.city} onChange={handleChange} required placeholder="Paris" />
              <Field label="Postal Code" name="postalCode" value={form.postalCode} onChange={handleChange} required placeholder="75001" />
            </div>
            <Field label="Country" name="country" value={form.country} onChange={handleChange} required placeholder="France" />
          </section>

          <section className="checkout-section">
            <h2 className="checkout-section__title">Order Notes</h2>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="checkout-notes"
              placeholder="Special instructions, gift message, delivery preferences…"
              rows={3}
            />
          </section>

          {error && <p className="checkout-error">{error}</p>}

          <button type="submit" className="btn checkout-submit" disabled={submitting}>
            {submitting ? 'Placing Order…' : 'Place Order'}
            {!submitting && <ArrowRight size={17} />}
          </button>

          <p className="checkout-secure">
            <Lock size={13} /> Secure &amp; encrypted checkout
          </p>
        </form>

        {/* ── Right: order summary ── */}
        <aside className="checkout-summary">
          <h2 className="checkout-summary__title">Order Summary</h2>

          <ul className="checkout-summary__items">
            {cartItems.map((item) => (
              <li key={`${item._id}-${item.selectedSize || 'no-size'}`} className="checkout-summary__item">
                <div className="checkout-summary__img-wrap">
                  {item.image ? (
                    <img src={getMediaUrl(item.image)} alt={item.name} className="checkout-summary__img" />
                  ) : (
                    <div className="checkout-summary__img-placeholder"><ShoppingBag size={18} strokeWidth={1} /></div>
                  )}
                  <span className="checkout-summary__qty">{item.quantity}</span>
                </div>
                <div className="flex flex-col flex-1">
                  <span className="checkout-summary__name">{item.name}</span>
                  {item.selectedSize && <span className="text-[10px] text-gray-dark uppercase font-medium">Size: {item.selectedSize}</span>}
                </div>
                <span className="checkout-summary__price">€{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="checkout-summary__divider" />

          <div className="checkout-summary__lines">
            <div className="checkout-summary__line">
              <span>Subtotal</span>
              <span>€{cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="checkout-summary__line">
              <span>Shipping</span>
              <span className="cart-summary__free">Complimentary</span>
            </div>
          </div>

          <div className="checkout-summary__divider" />

          <div className="checkout-summary__total">
            <span>Total</span>
            <span>€{cartSubtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
