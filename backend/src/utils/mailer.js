const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.EMAIL_FROM || 'ZTO Marketing Agency <onboarding@resend.dev>';

/**
 * Notify the ZTO admin team when a new lead submits the contact form.
 */
async function sendLeadNotification(lead) {
  await resend.emails.send({
    from:    FROM,
    to:      process.env.ADMIN_EMAIL,
    subject: `New Lead: ${lead.name} — ${lead.business_type}`,
    html: `
      <h2 style="color:#0A0F1E;font-family:sans-serif;">New Lead from ZTO Website</h2>
      <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td>
            <td style="padding:8px;border:1px solid #ddd;">${lead.name}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Contact</td>
            <td style="padding:8px;border:1px solid #ddd;">${lead.contact}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Business Type</td>
            <td style="padding:8px;border:1px solid #ddd;">${lead.business_type}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Challenge</td>
            <td style="padding:8px;border:1px solid #ddd;">${lead.challenge || 'Not specified'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Submitted</td>
            <td style="padding:8px;border:1px solid #ddd;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT</td></tr>
      </table>
      <p style="margin-top:16px;font-family:sans-serif;">
        <a href="${process.env.FRONTEND_URL}/admin.html"
           style="background:#FBBF24;color:#0A0F1E;padding:10px 20px;text-decoration:none;border-radius:6px;font-weight:bold;">
          View in Admin Dashboard
        </a>
      </p>
    `,
  });
}

/**
 * Send a welcome email to a newly created client account.
 */
async function sendClientWelcome(user, tempPassword) {
  await resend.emails.send({
    from:    FROM,
    to:      user.email,
    subject: 'Welcome to ZTO — Your Client Portal is Ready',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#0A0F1E;">Welcome, ${user.full_name}!</h1>
        <p>Your client portal has been set up. Log in to track your campaigns, view reports, and message your account manager.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin:24px 0;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Login URL</td>
              <td style="padding:8px;border:1px solid #ddd;">${process.env.FRONTEND_URL}/login.html</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td>
              <td style="padding:8px;border:1px solid #ddd;">${user.email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Temporary Password</td>
              <td style="padding:8px;border:1px solid #ddd;">${tempPassword}</td></tr>
        </table>
        <p style="color:#e11d48;font-size:13px;">⚠️ Please change your password immediately after logging in.</p>
        <a href="${process.env.FRONTEND_URL}/login.html"
           style="background:#FBBF24;color:#0A0F1E;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;margin-top:8px;">
          Go to My Portal
        </a>
      </div>
    `,
  });
}

/**
 * Send payment confirmation email to client.
 */
async function sendPaymentConfirmation(user, payment) {
  const amount = (payment.amount / 100).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' });
  await resend.emails.send({
    from:    FROM,
    to:      user.email,
    subject: `Payment Confirmed — ${payment.plan} Plan`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#0A0F1E;">Payment Confirmed ✓</h2>
        <p>Hi ${user.full_name}, we've received your payment for the <strong>${payment.plan}</strong> plan.</p>
        <table style="border-collapse:collapse;width:100%;font-size:14px;margin:24px 0;">
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Reference</td>
              <td style="padding:8px;border:1px solid #ddd;">${payment.reference}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Amount</td>
              <td style="padding:8px;border:1px solid #ddd;">${amount}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Plan</td>
              <td style="padding:8px;border:1px solid #ddd;">${payment.plan}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Date</td>
              <td style="padding:8px;border:1px solid #ddd;">${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })} WAT</td></tr>
        </table>
        <a href="${process.env.FRONTEND_URL}/portal.html"
           style="background:#FBBF24;color:#0A0F1E;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
          View My Portal
        </a>
      </div>
    `,
  });
}

module.exports = { sendLeadNotification, sendClientWelcome, sendPaymentConfirmation };
