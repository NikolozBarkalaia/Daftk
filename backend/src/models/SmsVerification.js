'use strict';

const { pool } = require('../config/db');
const { randomInt, createHash, timingSafeEqual } = require('node:crypto');

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_HOURS = 1;
const RATE_LIMIT_MAX = 5;
// Wrong-attempt cooldown levels before a new SMS can be requested
const COOLDOWN_TRIGGER_ATTEMPTS = 2; // wrong entries before cooldown kicks in
const COOLDOWN_MINUTES = [1, 3];     // level 1 = 1 min, level 2+ = 3 min

/** SHA-256 hex hash of the plaintext OTP code */
function hashCode(code) {
  return createHash('sha256').update(String(code)).digest('hex');
}

const SmsVerification = {
  /**
   * Returns true if the phone is within the rate limit.
   * All datetime comparisons run fully inside MySQL to avoid timezone issues.
   */
  async checkRateLimit(phone) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM sms_otps
       WHERE phone = ?
         AND createdAt > DATE_SUB(NOW(), INTERVAL ? HOUR)`,
      [phone, RATE_LIMIT_HOURS]
    );
    return rows[0].cnt < RATE_LIMIT_MAX;
  },

  /**
   * Creates a new OTP for the given phone.
   * Expiry and cleanup timestamps are computed by MySQL to stay timezone-consistent.
   * Returns the plaintext 6-digit code to be sent via SMS.
   */
  async create(phone) {
    // Purge expired OTPs for this phone (using MySQL's NOW())
    await pool.query(
      'DELETE FROM sms_otps WHERE phone = ? AND expiresAt < NOW()',
      [phone]
    );

    const code = String(randomInt(100000, 1000000)).padStart(6, '0');
    const codeHash = hashCode(code);

    await pool.query(
      `INSERT INTO sms_otps (phone, codeHash, expiresAt)
       VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))`,
      [phone, codeHash, OTP_TTL_MINUTES]
    );

    return code;
  },

  /**
   * Verifies a submitted OTP for the given phone.
   * Returns { valid: true } on success (OTP is consumed).
   * Returns { valid: false, reason, attemptsLeft? } on failure.
   * Reasons: 'no_otp' | 'max_attempts' | 'invalid_code'
   */
  async verify(phone, code) {
    const [rows] = await pool.query(
      `SELECT * FROM sms_otps
       WHERE phone = ? AND expiresAt > NOW()
       ORDER BY createdAt DESC
       LIMIT 1`,
      [phone]
    );

    if (!rows.length) {
      return { valid: false, reason: 'no_otp' };
    }

    const record = rows[0];

    if (record.attempts >= MAX_ATTEMPTS) {
      await pool.query('DELETE FROM sms_otps WHERE id = ?', [record.id]);
      return { valid: false, reason: 'max_attempts' };
    }

    // Timing-safe comparison
    const inputHash = Buffer.from(hashCode(code));
    const storedHash = Buffer.from(record.codeHash);
    const match =
      inputHash.length === storedHash.length &&
      timingSafeEqual(inputHash, storedHash);

    if (!match) {
      await pool.query(
        'UPDATE sms_otps SET attempts = attempts + 1 WHERE id = ?',
        [record.id]
      );
      const newAttempts = record.attempts + 1;
      const attemptsLeft = MAX_ATTEMPTS - newAttempts;

      // Trigger resend cooldown after enough wrong attempts
      if (newAttempts >= COOLDOWN_TRIGGER_ATTEMPTS) {
        await SmsVerification.setCooldown(phone);
      }

      return { valid: false, reason: 'invalid_code', attemptsLeft };
    }

    // Valid — consume (single-use) and clear any cooldown
    await pool.query('DELETE FROM sms_otps WHERE id = ?', [record.id]);
    await pool.query('DELETE FROM sms_cooldowns WHERE phone = ?', [phone]);
    return { valid: true };
  },

  /** Purge all expired OTPs. */
  async cleanup() {
    await pool.query('DELETE FROM sms_otps WHERE expiresAt < NOW()');
  },

  /**
   * Set (or escalate) a resend cooldown for the phone.
   * Level 1 = 1 minute, level 2+ = 3 minutes.
   */
  async setCooldown(phone) {
    const [rows] = await pool.query(
      'SELECT level FROM sms_cooldowns WHERE phone = ?',
      [phone]
    );
    const prevLevel = rows.length ? rows[0].level : 0;
    const newLevel = Math.min(prevLevel + 1, 2);
    const minutes = COOLDOWN_MINUTES[newLevel - 1];

    await pool.query(
      `INSERT INTO sms_cooldowns (phone, cooldownUntil, level)
       VALUES (?, DATE_ADD(NOW(), INTERVAL ? MINUTE), ?)
       ON DUPLICATE KEY UPDATE
         cooldownUntil = DATE_ADD(NOW(), INTERVAL ? MINUTE),
         level = ?`,
      [phone, minutes, newLevel, minutes, newLevel]
    );
  },

  /**
   * Returns { blocked: false } or { blocked: true, secondsLeft: N }
   */
  async checkResendCooldown(phone) {
    const [rows] = await pool.query(
      `SELECT GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), cooldownUntil)) AS secondsLeft
       FROM sms_cooldowns WHERE phone = ? AND cooldownUntil > NOW()`,
      [phone]
    );
    if (!rows.length) return { blocked: false };
    return { blocked: true, secondsLeft: rows[0].secondsLeft };
  },
};

module.exports = SmsVerification;

