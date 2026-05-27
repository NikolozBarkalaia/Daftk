'use strict';

const { pool } = require('../config/db');
const { randomInt, createHash, timingSafeEqual } = require('node:crypto');

const OTP_TTL_MINUTES = 10;       // code valid for 10 minutes
const MAX_ATTEMPTS   = 5;         // wrong attempts before OTP is burned
const RATE_LIMIT_HOURS = 1;       // sliding window for per-phone limit
const RATE_LIMIT_MAX   = 5;       // max SMS sends per phone per hour
const RESEND_THROTTLE  = 60;      // seconds between sends for same phone

function hashCode(code) {
  return createHash('sha256').update(String(code)).digest('hex');
}

const SmsVerification = {
  /**
   * Per-phone hourly cap: max 5 SMS sends per phone per hour.
   * Returns true if within limit.
   */
  async checkRateLimit(phone) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM sms_otps
       WHERE phone = ? AND createdAt > DATE_SUB(NOW(), INTERVAL ? HOUR)`,
      [phone, RATE_LIMIT_HOURS]
    );
    return rows[0].cnt < RATE_LIMIT_MAX;
  },

  /**
   * Per-phone resend throttle: must wait 60s between sends.
   * Returns { blocked: false } or { blocked: true, secondsLeft: N }.
   */
  async checkResendThrottle(phone) {
    const [rows] = await pool.query(
      `SELECT GREATEST(0, ? - TIMESTAMPDIFF(SECOND, createdAt, NOW())) AS secondsLeft
       FROM sms_otps
       WHERE phone = ? AND expiresAt > NOW()
       ORDER BY createdAt DESC LIMIT 1`,
      [RESEND_THROTTLE, phone]
    );
    if (!rows.length) return { blocked: false };
    const s = rows[0].secondsLeft;
    return s > 0 ? { blocked: true, secondsLeft: s } : { blocked: false };
  },

  /** Create a new OTP for the phone. Returns plaintext 6-digit code. */
  async create(phone) {
    await pool.query('DELETE FROM sms_otps WHERE phone = ? AND expiresAt < NOW()', [phone]);
    const code = String(randomInt(100000, 1000000)).padStart(6, '0');
    await pool.query(
      `INSERT INTO sms_otps (phone, codeHash, expiresAt)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [phone, hashCode(code), OTP_TTL_MINUTES]
    );
    return code;
  },

  /**
   * Verify submitted code for the phone.
   * Returns { valid: true } or { valid: false, reason, attemptsLeft? }.
   * Reasons: 'no_otp' | 'max_attempts' | 'invalid_code'
   */
  async verify(phone, code) {
    const [rows] = await pool.query(
      `SELECT * FROM sms_otps WHERE phone = ? AND expiresAt > NOW()
       ORDER BY createdAt DESC LIMIT 1`,
      [phone]
    );

    if (!rows.length) return { valid: false, reason: 'no_otp' };

    const record = rows[0];

    if (record.attempts >= MAX_ATTEMPTS) {
      await pool.query('DELETE FROM sms_otps WHERE id = ?', [record.id]);
      return { valid: false, reason: 'max_attempts' };
    }

    const inputHash  = Buffer.from(hashCode(code));
    const storedHash = Buffer.from(record.codeHash);
    const match = inputHash.length === storedHash.length &&
      timingSafeEqual(inputHash, storedHash);

    if (!match) {
      await pool.query('UPDATE sms_otps SET attempts = attempts + 1 WHERE id = ?', [record.id]);
      return { valid: false, reason: 'invalid_code', attemptsLeft: MAX_ATTEMPTS - record.attempts - 1 };
    }

    // Valid — single-use, consume immediately
    await pool.query('DELETE FROM sms_otps WHERE id = ?', [record.id]);
    return { valid: true };
  },

  /** Periodic cleanup of all expired OTPs. */
  async cleanup() {
    await pool.query('DELETE FROM sms_otps WHERE expiresAt < NOW()');
  },
};

module.exports = SmsVerification;

