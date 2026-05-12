import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { getMyOrders } from '../services/api';

const STATUS_LABEL = {
  pending: 'Received',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const MyOrders = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/admin/login', { state: { from: '/orders' } });
      return;
    }
    getMyOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="container pb-20">
        <p className="orders-loading">Loading your orders…</p>
      </div>
    );
  }

  return (
    <div className="container pb-20">
      <h1 className="page-title" style={{ textAlign: 'left' }}>My Orders</h1>

      {error && <p className="checkout-error">{error}</p>}

      {orders.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty__icon"><Package size={64} strokeWidth={0.8} /></div>
          <h2 className="cart-empty__title">No orders yet</h2>
          <p className="cart-empty__sub">Your placed orders will appear here.</p>
          <Link to="/shop" className="btn cart-empty__cta">Explore Collection</Link>
        </div>
      ) : (
        <ul className="orders-list">
          {orders.map((order) => (
            <li key={order.id} className="orders-row">
              <div className="orders-row__info">
                <span className="orders-row__num">Order #{order.id}</span>
                <span className="orders-row__date">
                  {new Date(order.createdAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </span>
              </div>

              <div className="orders-row__items-preview">
                {order.items.slice(0, 2).map((item, i) => (
                  <span key={i} className="orders-row__item-name">
                    {item.name} × {item.quantity}
                  </span>
                ))}
                {order.items.length > 2 && (
                  <span className="orders-row__more">+{order.items.length - 2} more</span>
                )}
              </div>

              <div className="orders-row__right">
                <span className={`order-badge order-badge--${order.status}`}>
                  {STATUS_LABEL[order.status] || order.status}
                </span>
                <span className="orders-row__total">€{Number(order.total).toFixed(2)}</span>
                <Link to={`/order-confirmation/${order.id}`} className="orders-row__detail">
                  Details <ChevronRight size={15} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyOrders;
