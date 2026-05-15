import React, { useEffect, useState } from 'react';
import { Package, RefreshCw, ChevronDown, ChevronUp, User, MapPin, Phone, MessageSquare, ShoppingCart } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

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
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { showSuccess, showError } = useNotification();

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
      showSuccess(`Order #${orderId} updated to ${status}`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
    } catch {
      showError('Failed to update status.');
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
                <th style={{ padding: '10px 8px' }}>Total</th>
                <th style={{ padding: '10px 8px' }}>Status</th>
                <th style={{ padding: '10px 8px' }}></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr 
                    style={{ 
                      borderBottom: '1px solid #e0e0e0',
                      cursor: 'pointer',
                      background: expandedOrderId === order.id ? '#f9f9f9' : 'transparent'
                    }}
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
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
                      <div style={{ fontWeight: 600 }}>₾{Number(order.total).toFixed(2)}</div>
                      {Number(order.total) > Number(order.subtotal) && (
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '2px' }}>
                          Inc. ₾{Number(order.total - order.subtotal).toFixed(2)} shipping
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }} onClick={(e) => e.stopPropagation()}>
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
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      {expandedOrderId === order.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </td>
                  </tr>

                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', background: '#fcfcfc', borderBottom: '1px solid #eee' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                          {/* Items Column */}
                          <div>
                            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ShoppingCart size={16} /> Order Items
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {order.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#fff', border: '1px solid #eee' }}>
                                  <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                      {item.selectedSize ? `Size: ${item.selectedSize}` : 'No size selected'}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.85rem' }}>{item.quantity} × ₾{Number(item.price).toFixed(2)}</div>
                                    <div style={{ fontWeight: 600 }}>₾{(item.quantity * item.price).toFixed(2)}</div>
                                  </div>
                                </div>
                              ))}
                              <div style={{ marginTop: '10px', padding: '10px', borderTop: '1px solid #000', textAlign: 'right' }}>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Subtotal: ₾{Number(order.subtotal).toFixed(2)}</div>
                                <div style={{ fontSize: '0.85rem', color: '#666' }}>Shipping: ₾{Number(order.total - order.subtotal).toFixed(2)}</div>
                                <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '4px' }}>Total: ₾{Number(order.total).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>

                          {/* Customer Column */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                              <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <User size={16} /> Customer Details
                              </h3>
                              <div style={{ background: '#fff', border: '1px solid #eee', padding: '15px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <User size={14} color="#999" /> <strong>{order.shippingAddress?.name}</strong>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <Phone size={14} color="#999" /> {order.shippingAddress?.phone || 'No phone provided'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                  <MapPin size={14} color="#999" style={{ marginTop: '3px' }} />
                                  <div>
                                    {order.shippingAddress?.address}<br />
                                    {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                                    {order.shippingAddress?.country}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {order.notes && (
                              <div>
                                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <MessageSquare size={16} /> Customer Notes
                                </h3>
                                <div style={{ background: '#fff', border: '1px solid #f0f0f0', padding: '15px', fontSize: '0.9rem', color: '#555', borderLeft: '4px solid #000' }}>
                                  "{order.notes}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
