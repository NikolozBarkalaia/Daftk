const { Resend } = require("resend");
const nodemailer = require("nodemailer");

const FROM = process.env.EMAIL_FROM || "DaftK <noreply@daftk.ge>";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5001";

/* ── Transport selection ─────────────────────────────────────
   - RESEND_API_KEY set  → use Resend (production)
   - RESEND_API_KEY empty → use nodemailer + Mailpit (local dev)
   Web UI: http://localhost:8025
─────────────────────────────────────────────────────────── */
let _resend = null;
let _smtp = null;

const useResend = () => Boolean(process.env.RESEND_API_KEY);

const getResend = () => {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
};

const getSmtp = () => {
  if (!_smtp) {
    _smtp = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025", 10),
      secure: false,
      ignoreTLS: true,
    });
  }
  return _smtp;
};

/* Unified send — same API for all three functions below */
const sendEmail = async ({ to, subject, html }) => {
  if (useResend()) {
    return getResend().emails.send({ from: FROM, to, subject, html });
  }
  const info = await getSmtp().sendMail({ from: FROM, to, subject, html });
  console.log(`\uD83D\uDCEC [Mailpit] ${subject} → ${to} (${info.messageId})`);
  return info;
};

/* ── 1. Verification email ────────────────────────────────── */
const sendVerificationEmail = async (email, token) => {
  try {
    const link = `${BACKEND_URL}/api/verify/${token}`;
    await sendEmail({
      to: email,
      subject: "Verify your DaftK account",
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;max-width:600px;width:100%;">
                <tr>
                  <td style="padding:40px 48px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
                    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:400;color:#050505;margin:0;letter-spacing:2px;">DAFTK</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 48px;">
                    <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:400;color:#050505;margin:0 0 16px;">Verify Your Email</h2>
                    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;">
                      Thank you for creating an account. Click below to verify your email address and complete your registration.
                    </p>
                    <a href="${link}" style="display:inline-block;padding:14px 36px;background:#050505;color:#fff;font-size:13px;text-transform:uppercase;letter-spacing:2px;text-decoration:none;border:1px solid gold;">
                      Verify Account
                    </a>
                    <p style="color:#999;font-size:12px;margin:32px 0 0;">This link expires in 24 hours. If you did not create an account, please ignore this email.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 48px;text-align:center;border-top:1px solid #f0f0f0;">
                    <p style="color:#bbb;font-size:12px;margin:0;">© ${new Date().getFullYear()} DaftK. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log("✅ Verification email sent to", email);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error.message);
  }
};

/* ── 2. Order confirmation email ──────────────────────────── */
const sendOrderConfirmationEmail = async (email, order) => {

  try {
    const addr = order.shippingAddress || {};
    const itemsHtml = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
            ${item.name}${item.selectedSize ? ` <span style="color:#999;">(${item.selectedSize})</span>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:center;">×${item.quantity}</td>
          <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right;">
            ₾${(Number(item.price) * Number(item.quantity)).toFixed(2)}
          </td>
        </tr>`
      )
      .join("");

    await sendEmail({
      to: email,
      subject: `Order Confirmed – #${order.id} | DaftK`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;max-width:600px;width:100%;">
                <!-- Header -->
                <tr>
                  <td style="padding:40px 48px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
                    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:400;color:#050505;margin:0;letter-spacing:2px;">DAFTK</h1>
                  </td>
                </tr>
                <!-- Hero message -->
                <tr>
                  <td style="padding:40px 48px 24px;text-align:center;">
                    <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:400;color:#050505;margin:0 0 12px;">Thank You For Your Order</h2>
                    <p style="color:#555;font-size:15px;margin:0;">Your order <strong>#${order.id}</strong> has been received and is being prepared with care.</p>
                  </td>
                </tr>
                <!-- Order meta -->
                <tr>
                  <td style="padding:0 48px 32px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #e0e0e0;padding:20px;">
                      <tr>
                        <td style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;padding-bottom:6px;">Order Date</td>
                        <td style="font-size:14px;color:#333;text-align:right;padding-bottom:6px;">
                          ${new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Status</td>
                        <td style="font-size:14px;color:#333;text-align:right;">Order Received</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Items -->
                <tr>
                  <td style="padding:0 48px 32px;">
                    <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#999;margin:0 0 12px;">Items Ordered</h3>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${itemsHtml}
                      <tr>
                        <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:600;color:#050505;">Total</td>
                        <td style="padding:14px 0 0;font-size:16px;font-weight:600;color:#050505;text-align:right;">₾${Number(order.total).toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Shipping -->
                ${addr.address ? `
                <tr>
                  <td style="padding:0 48px 32px;">
                    <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#999;margin:0 0 12px;">Delivery Address</h3>
                    <p style="font-size:14px;color:#333;line-height:1.7;margin:0;">
                      ${addr.name || ""}<br>
                      ${addr.address}<br>
                      ${addr.city}${addr.postalCode ? ` ${addr.postalCode}` : ""}<br>
                      ${addr.country || ""}${addr.phone ? `<br>${addr.phone}` : ""}
                    </p>
                  </td>
                </tr>` : ""}
                <!-- Footer -->
                <tr>
                  <td style="padding:24px 48px;text-align:center;border-top:1px solid #f0f0f0;background:#f9f9f9;">
                    <p style="color:#555;font-size:13px;margin:0 0 8px;">Questions? Reply to this email or contact us at <a href="mailto:info@daftk.ge" style="color:#050505;">info@daftk.ge</a></p>
                    <p style="color:#bbb;font-size:12px;margin:0;">© ${new Date().getFullYear()} DaftK. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log("✅ Order confirmation email sent to", email, "for order #", order.id);
  } catch (error) {
    console.error("❌ Failed to send order confirmation email:", error.message);
  }
};

module.exports = { sendVerificationEmail, sendOrderConfirmationEmail, sendOrderLookupEmail };

/* ── 3. Order lookup OTP email ────────────────────────────── */
async function sendOrderLookupEmail(email, code) {
  try {
    await sendEmail({
      to: email,
      subject: `Your DaftK order lookup code: ${code}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e0e0e0;max-width:600px;width:100%;">
                <tr>
                  <td style="padding:40px 48px 24px;text-align:center;border-bottom:1px solid #f0f0f0;">
                    <h1 style="font-family:'Playfair Display',Georgia,serif;font-size:28px;font-weight:400;color:#050505;margin:0;letter-spacing:2px;">DAFTK</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 48px;text-align:center;">
                    <h2 style="font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:400;color:#050505;margin:0 0 16px;">Order Lookup Code</h2>
                    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 32px;">
                      Enter the code below to view your orders. It expires in <strong>10 minutes</strong>.
                    </p>
                    <div style="display:inline-block;padding:20px 56px;background:#050505;color:#fff;font-size:34px;font-weight:700;letter-spacing:10px;border:1px solid gold;">
                      ${code}
                    </div>
                    <p style="color:#999;font-size:12px;margin:32px 0 0;">If you did not request this, please ignore this email.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:24px 48px;text-align:center;border-top:1px solid #f0f0f0;background:#f9f9f9;">
                    <p style="color:#bbb;font-size:12px;margin:0;">© ${new Date().getFullYear()} DaftK. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });
    console.log("✅ Lookup code sent to", email);
  } catch (error) {
    console.error("❌ Failed to send lookup email:", error.message);
  }
}