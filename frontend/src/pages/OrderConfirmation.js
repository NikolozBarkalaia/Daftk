import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { getOrderByToken } from '../services/api';

const STATUS_LABEL = {
  pending:    'Order Received',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

const OrderConfirmation = () => {
  const { token } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (!order) {
      getOrderByToken(token)
        .then(({ data }) => setOrder(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [token, order]);

  if (loading) {
    return (
      <div className="container pb-20">
        <div className="order-conf__loading">Loading your order…</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container pb-20">
        <div className="order-conf__notfound">
          <h2>Order not found</h2>
          <Link to="/shop" className="btn">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  const addr = order.shippingAddress;

  return (
    <div className="container pb-20">
      <div className="order-conf">
        <div className="order-conf__icon">
          <CheckCircle size={56} strokeWidth={0.8} />
        </div>
        <h1 className="order-conf__title">Thank You</h1>
        <p className="order-conf__sub">
          Your order has been received and is being prepared with care.
        </p>

        <div className="order-conf__card">
          <div className="order-conf__meta">
            <div className="order-conf__meta-item">
              <span className="order-conf__meta-label">Order</span>
              <span className="order-conf__meta-val">#{order.id}</span>
            </div>
            <div className="order-conf__meta-item">
              <span className="order-conf__meta-label">Date</span>
              <span className="order-conf__meta-val">
                {new Date(order.createdAt).toLocaleDateString('en-GB', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </span>
            </div>
            <div className="order-conf__meta-item">
              <span className="order-conf__meta-label">Total</span>
              <span className="order-conf__meta-val">€{Number(order.total).toFixed(2)}</span>
            </div>
            <div className="order-conf__meta-item">
              <span className="order-conf__meta-label">Status</span>
              <span className={`order-badge order-badge--${order.status}`}>
                {STATUS_LABEL[order.status] || order.status}
              </span>
            </div>
          </div>

          <div className="order-conf__divider" />

          {/* Items */}
          <h3 className="order-conf__section-title">
            <Package size={16} /> Items Ordered
          </h3>
          <ul className="order-conf__items">
            {order.items.map((item, i) => (
              <li key={i} className="order-conf__item">
                <span className="order-conf__item-name">{item.name}</span>
                <span className="order-conf__item-qty">× {item.quantity}</span>
                <span className="order-conf__item-price">€{(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>

          <div className="order-conf__divider" />

          {/* Shipping */}
          <h3 className="order-conf__section-title">Delivery Address</h3>
          <address className="order-conf__address">
            <strong>{addr.name}</strong><br />
            {addr.address}<br />
            {addr.postalCode} {addr.city}<br />
            {addr.country}
            {addr.phone && <><br />{addr.phone}</>}
          </address>
        </div>

        <div className="order-conf__actions">
          <Link to="/orders" className="btn-outline order-conf__orders-link">
            View My Orders
          </Link>
          <Link to="/shop" className="btn order-conf__shop-link">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
