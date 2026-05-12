const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, token) => {
  try {
   const link = `http://localhost:5001/api/verify/${token}`;

    const result = await resend.emails.send({
      from: "DaftK <onboarding@resend.dev>",
      to: email,
      subject: "Verify your email",
      html: `
        <p>Click to verify:</p>
        <a href="${link}">VERIFY ACCOUNT</a>
      `
    });

    console.log("✅ EMAIL SENT:", result);
    return result;
  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
};

module.exports = { sendVerificationEmail };