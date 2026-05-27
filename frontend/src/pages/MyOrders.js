import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Smartphone, KeyRound, RotateCcw, Check } from 'lucide-react';
import { requestOrderLookup, verifyOrderLookup, getOrderByToken, getMediaUrl } from '../services/api';

const ORDERS_KEY = 'daftk_orders';
const STATUS_CACHE_KEY = 'daftk_order_statuses'; // { [token]: status }

// Merge new tokens into localStorage and update status cache
const persistOrders = (orders) => {
  try {
    const existing = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    const tokens = existing.map((e) => (typeof e === 'string' ? e : e.token)).filter(Boolean);
    const newTokens = orders.map((o) => o.token).filter(Boolean);
    const merged = [...new Set([...tokens, ...newTokens])];
    localStorage.setItem(ORDERS_KEY, JSON.stringify(merged));

    // Update status cache
    const cache = JSON.parse(localStorage.getItem(STATUS_CACHE_KEY) || '{}');
    orders.forEach((o) => { if (o.token) cache[o.token] = o.status; });
    localStorage.setItem(STATUS_CACHE_KEY, JSON.stringify(cache));
    window.dispatchEvent(new Event('ordersUpdated'));
  } catch { }
};

const STATUS_LABEL = {
  pending: 'Received',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const mergeOrders = (local, fromEmail) => {
  const map = new Map();
  [...local, ...fromEmail].forEach((o) => map.set(o.id, o));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

/* ─── Step indicator ─────────────────────────────────────── */
const STEPS = ['Phone', 'Code', 'Done'];

const StepIndicator = ({ step }) => {
  const activeIdx = step === 'idle' ? 0 : step === 'sent' ? 1 : 2;
  return (
    <div className="ol-steps">
      {STEPS.map((label, i) => (
        <React.Fragment key={label}>
          <div className={`ol-step${i <= activeIdx ? ' ol-step--active' : ''}`}>
            <div className="ol-step__dot">
              {i < activeIdx && <Check size={9} strokeWidth={3} />}
            </div>
            <span className="ol-step__label">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`ol-step__line${i < activeIdx ? ' ol-step__line--done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ─── 6-box OTP input ────────────────────────────────────── */
const OtpBoxes = ({ value = '', onChange, disabled }) => {
  const refs = useRef([]);

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = Array.from({ length: 6 }, (_, j) => value[j] || '');
    arr[i] = char;
    onChange(arr.join(''));
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        // clear current box
        const arr = Array.from({ length: 6 }, (_, j) => value[j] || '');
        arr[i] = '';
        onChange(arr.join(''));
      } else if (i > 0) {
        // move to previous and clear it
        const arr = Array.from({ length: 6 }, (_, j) => value[j] || '');
        arr[i - 1] = '';
        onChange(arr.join(''));
        refs.current[i - 1]?.focus();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < 5) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(digits);
    const focusIdx = Math.min(digits.length, 5);
    setTimeout(() => refs.current[focusIdx]?.focus(), 0);
  };

  return (
    <div className="otp-boxes">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-box${value[i] ? ' otp-box--filled' : ''}`}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          autoFocus={i === 0}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

/* ─── Single order row ───────────────────────────────────── */
const OrderRow = ({ order }) => {
  const firstImage = order.items?.[0]?.image;

  return (
    <li className="orders-row">
      {firstImage && (
        <div className="orders-row__thumb">
          <img src={getMediaUrl(firstImage)} alt="" className="orders-row__thumb-img" />
        </div>
      )}

      <div className="orders-row__body">
        <div className="orders-row__meta">
          <span className="orders-row__num">Order #{order.id}</span>
          <span className="orders-row__date">
            {new Date(order.createdAt).toLocaleDateString('en-GB', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </span>
        </div>
        <div className="orders-row__items">
          {order.items.slice(0, 2).map((item, i) => (
            <span key={i} className="orders-row__item-name">
              {item.name}
              {item.selectedSize ? <span className="orders-row__item-size"> · {item.selectedSize}</span> : ''} × {item.quantity}
            </span>
          ))}
          {order.items.length > 2 && (
            <span className="orders-row__more">
              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="orders-row__right">
        <span className={`order-badge order-badge--${order.status}`}>
          {STATUS_LABEL[order.status] || order.status}
        </span>
        <span className="orders-row__total">₾{Number(order.total).toFixed(2)}</span>
        <Link to={`/order-confirmation/${order.token || order.id}`} className="orders-row__cta">
          View <ChevronRight size={14} />
        </Link>
      </div>
    </li>
  );
};

/* ─── My Orders Page ─────────────────────────────────────── */
const MyOrders = () => {
  const [localOrders, setLocalOrders] = useState([]);
  const [phoneOrders, setPhoneOrders] = useState([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [step, setStep] = useState('idle'); // 'idle' | 'sent' | 'verified'
  const [phoneInput, setPhoneInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0); // seconds remaining
  const [attemptsLeft, setAttemptsLeft] = useState(null);
  const [maxAttemptsReached, setMaxAttemptsReached] = useState(false);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Load orders by fetching each stored token from the backend
  useEffect(() => {
    let cancelled = false;
    const raw = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    // Support legacy format (array of objects) and new format (array of token strings)
    const tokens = raw.map((e) => (typeof e === 'string' ? e : e.token)).filter(Boolean);

    if (tokens.length === 0) {
      setLocalLoading(false);
      return;
    }

    Promise.all(
      tokens.map((token) =>
        getOrderByToken(token)
          .then(({ data }) => ({ token, data }))
          .catch(() => ({ token, data: null }))
      )
    ).then((results) => {
      if (cancelled) return;
      const validTokens = results.filter((r) => r.data !== null).map((r) => r.token);
      const orders = results.filter((r) => r.data !== null).map((r) => r.data);

      // Prune stale tokens from localStorage
      if (validTokens.length !== tokens.length) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(validTokens));
      }

      setLocalOrders(orders);
      persistOrders(orders); // keep status cache fresh
      setLocalLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const allOrders = mergeOrders(localOrders, phoneOrders);

  /* ── Request OTP via SMS ── */
  const handleRequestCode = async (e) => {
    e?.preventDefault?.();
    const trimmed = phoneInput.trim();
    if (trimmed.replace(/\D/g, '').length < 9) return;
    setError('');
    setCodeInput('');
    setAttemptsLeft(null);
    setMaxAttemptsReached(false);
    setLoading(true);
    try {
      await requestOrderLookup('+995' + trimmed);
      setResendCooldown(0);
      setStep('sent');
    } catch (err) {
      const seconds = err.response?.data?.secondsLeft;
      if (seconds) {
        setResendCooldown(seconds);
        setStep('sent'); // stay on code step so user sees the countdown
      } else {
        setError(err.response?.data?.message || 'Failed to send code. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Verify SMS OTP ── */
  const handleVerify = async (e) => {
    e.preventDefault();
    if (codeInput.length < 6) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyOrderLookup('+995' + phoneInput.trim(), codeInput.trim());
      setPhoneOrders(data);
      persistOrders(data);
      setResendCooldown(0);
      setStep('verified');
    } catch (err) {
      const reason = err.response?.data?.reason;
      const left = err.response?.data?.attemptsLeft;
      if (reason === 'max_attempts') {
        setMaxAttemptsReached(true);
        setCodeInput('');
        setError('Too many failed attempts. Please request a new code.');
      } else if (reason === 'invalid_code') {
        setAttemptsLeft(left);
        setError(
          left != null && left > 0
            ? `Incorrect code. ${left} attempt${left !== 1 ? 's' : ''} remaining.`
            : 'Incorrect code.'
        );
      } else {
        setError(err.response?.data?.message || 'Invalid or expired code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetLookup = () => {
    setStep('idle');
    setPhoneInput('');
    setCodeInput('');
    setError('');
    setPhoneOrders([]);
    setResendCooldown(0);
    setAttemptsLeft(null);
    setMaxAttemptsReached(false);
  };

  const hasOrders = allOrders.length > 0;

  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* ── Page header ── */}
      <div className="orders-page-header">
        <h1 className="orders-page-header__title">My Orders</h1>
        {hasOrders && (
          <span className="orders-page-header__count">
            {allOrders.length} order{allOrders.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Order list ── */}
      {localLoading ? (
        <p style={{ color: 'var(--color-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Loading your orders…
        </p>
      ) : hasOrders && (
        <ul className="orders-list">
          {allOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
        </ul>
      )}

      {/* ── Email lookup section ── */}
      <div className={`orders-lookup${hasOrders ? ' orders-lookup--with-orders' : ''}`}>
        <div className="orders-lookup__card">
          {/* Icon hint when no local orders, before form starts */}
          {!hasOrders && step === 'idle' && (
            <div className="ol-no-orders-hint">
              <Package size={32} strokeWidth={0.75} />
              <span>No orders on this device — look up by phone below</span>
            </div>
          )}
          <StepIndicator step={step} />

          {/* ─ Verified ─ */}
          {step === 'verified' && (
            <div className="ol-verified">
              <div className="ol-verified__check">
                <Check size={16} strokeWidth={2.5} />
              </div>
              <div className="ol-verified__info">
                <p className="ol-verified__label">Orders loaded for</p>
                <p className="ol-verified__email">+995 {phoneInput}</p>
                {phoneOrders.length === 0 && (
                  <p className="ol-verified__empty">No orders found with this phone number.</p>
                )}
              </div>
              <button className="ol-reset-btn" onClick={resetLookup}>
                <RotateCcw size={12} /> Search another number
              </button>
            </div>
          )}

          {/* ─ Idle: enter phone ─ */}
          {step === 'idle' && (
            <>
              <h2 className="orders-lookup__title">Find orders by phone</h2>
              <p className="orders-lookup__sub">
                Enter the phone number you used at checkout. We'll send a one-time SMS code to verify it's you.
              </p>
              <form className="ol-form" onSubmit={handleRequestCode}>
                <div className="phone-prefix-wrap ol-form__phone-wrap">
                  <span className="phone-prefix-label" aria-hidden="true">+995</span>
                  <input
                    type="tel"
                    className="input-field phone-prefix-input"
                    placeholder="5XX XXX XXX"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    required
                    autoFocus
                    maxLength={9}
                  />
                </div>
                <button type="submit" className="btn ol-form__btn" disabled={loading || resendCooldown > 0}>
                  {loading ? 'Sending…' : resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Send Code'}
                </button>
              </form>
              {error && <p className="ol-error">{error}</p>}
              {resendCooldown > 0 && (
                <p className="ol-cooldown">
                  Too many wrong attempts — resend available in <strong>{resendCooldown}s</strong>
                </p>
              )}
            </>
          )}

          {/* ─ Sent: enter SMS code ─ */}
          {step === 'sent' && (
            <>
              <div className="ol-sent-notice">
                <Smartphone size={13} strokeWidth={1.5} />
                Code sent to <strong>+995&nbsp;{phoneInput}</strong>
              </div>

              <h2 className="orders-lookup__title">Enter your code</h2>
              <p className="orders-lookup__sub">
                Check your SMS for a 6-digit code. It expires in 10 minutes.
              </p>

              <form onSubmit={handleVerify}>
                <OtpBoxes
                  value={codeInput}
                  onChange={(v) => { setCodeInput(v); if (!maxAttemptsReached) setError(''); }}
                  disabled={maxAttemptsReached || loading}
                />

                {attemptsLeft !== null && attemptsLeft <= 3 && !maxAttemptsReached && (
                  <p className="ol-attempts">
                    {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
                  </p>
                )}

                {error && <p className="ol-error">{error}</p>}

                {!maxAttemptsReached && (
                  <button
                    type="submit"
                    className="btn ol-verify-btn"
                    disabled={loading || codeInput.replace(/\D/g, '').length < 6}
                  >
                    {loading ? 'Verifying…' : <><KeyRound size={14} /> Verify</>}
                  </button>
                )}

                <div className="ol-actions">
                  <button
                    type="button"
                    className="ol-resend-btn"
                    onClick={handleRequestCode}
                    disabled={loading || resendCooldown > 0}
                  >
                    <RotateCcw size={12} />
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : maxAttemptsReached ? 'Request new code' : 'Resend code'
                    }
                  </button>
                  <button type="button" className="ol-change-email-btn" onClick={resetLookup}>
                    ← Change number
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
