'use strict';

const UBILL_BASE_URL = 'https://api.ubill.dev';

/**
 * Normalizes a phone number to Georgian E.164-like format: "995XXXXXXXXX"
 * Accepts: +995XXXXXXXXX, 995XXXXXXXXX, 0XXXXXXXXX, XXXXXXXXX (9 digits)
 */
function normalizePhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.startsWith('995') && digits.length === 12) return digits;
  if (digits.startsWith('0') && digits.length === 10) return '995' + digits.slice(1);
  if (digits.length === 9) return '995' + digits;
  return digits; // return as-is for other formats (international)
}

/**
 * Sends an OTP SMS via the Ubill SMS API.
 * @param {string} phone  Recipient phone number (any format)
 * @param {string} otp    6-digit OTP code
 * @returns {Promise<object>} Ubill API response body
 */
async function sendOtpSms(phone, otp) {
  const apiKey = process.env.UBILL_API_KEY;
  const brandIdRaw = process.env.UBILL_BRAND_ID || '';
  // Accept numeric or string brand IDs (Ubill may use either)
  const brandId = /^\d+$/.test(brandIdRaw.trim()) ? parseInt(brandIdRaw.trim(), 10) : brandIdRaw.trim();

  console.log('[SMS] sendOtpSms called');
  console.log('[SMS] UBILL_API_KEY set:', !!apiKey, apiKey ? `(${apiKey.slice(0, 4)}***)` : '(missing)');
  console.log('[SMS] UBILL_BRAND_ID raw:', JSON.stringify(brandIdRaw), '→ resolved:', brandId, typeof brandId);

  if (!apiKey || !brandId) {
    const missing = [!apiKey && 'UBILL_API_KEY', !brandId && 'UBILL_BRAND_ID'].filter(Boolean).join(', ');
    console.error('[SMS] ABORT — missing env vars:', missing);
    throw new Error(
      `Ubill SMS not configured — set ${missing} in .env`
    );
  }

  const normalized = normalizePhone(phone);
  console.log('[SMS] normalized phone:', normalized);

  const body = {
    brandID: brandId,
    numbers: [normalized],
    text: `DaftK: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
    stopList: false,
  };
  console.log('[SMS] POST', `${UBILL_BASE_URL}/v1/sms/send`, JSON.stringify(body));

  const response = await fetch(`${UBILL_BASE_URL}/v1/sms/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      key: apiKey,
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text().catch(() => '');
  console.log('[SMS] Ubill response status:', response.status);
  console.log('[SMS] Ubill response body:', responseText);

  if (!response.ok) {
    console.error(`[SMS] Ubill API error ${response.status}: ${responseText}`);
    throw new Error(`SMS delivery failed (status ${response.status}): ${responseText}`);
  }

  let parsed;
  try { parsed = JSON.parse(responseText); } catch { parsed = responseText; }
  console.log('[SMS] Success:', parsed);
  return parsed;
}

module.exports = { normalizePhone, sendOtpSms };
