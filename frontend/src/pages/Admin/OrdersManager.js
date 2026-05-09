import React, { useEffect, useState } from 'react';
import { Package, RefreshCw } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../services/api';

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_LABEL = {
  pending:    'Received',
  processing: 'Processing',
  shipped:    'Shipped',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
};

const OrdersManager = () => {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [updating, setUpdating] = useState(null); // order id being updated

  const fetchOrders = () => {
    setLoading(true);
    getAllOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, status) => {
    setUpdating(orderId);
    try {
      const { data } = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    } catch {
      alert('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-serif)' }}>Orders</h1>
        <button
          onClick={fetchOrders}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #ccc', padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#999' }}>
          <Package size={48} strokeWidth={0.8} />
          <p style={{ marginTop: '1rem' }}>No orders yet.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '10px 8px' }}>Order</th>
                <th style={{ padding: '10px 8px' }}>Date</th>
                <th style={{ padding: '10px 8px' }}>Customer</th>
                <th style={{ padding: '10px 8px' }}>Items</th>
                <th style={{ padding: '10px 8px' }}>Total</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '12px 8px', fontWeight: 500 }}>#{order.id}</td>
                  <td style={{ padding: '12px 8px', color: '#666' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div>{order.shippingAddress?.name || '—'}</div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>{order.shippingAddress?.email || ''}</div>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '0.8rem', color: '#555' }}>
                        {item.name} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td style={{ padding: '12px 8px', fontWeight: 600 }}>
                    €{Number(order.total).toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #ccc',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        background: '#fff',
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
