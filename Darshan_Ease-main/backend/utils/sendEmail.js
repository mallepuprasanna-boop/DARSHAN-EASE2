const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer.
 * Automatically falls back to Ethereal email if no SMTP details are in .env
 */
const sendEmail = async ({ to, subject, html }) => {
  let transporter;

  const hasSMTPConfig = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (hasSMTPConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    try {
      // Create a test Ethereal account dynamically
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('Nodemailer test account creation failed. Logging email to console instead.');
      console.log(`
=========================================
EMAIL LOG FALLBACK (No SMTP config found)
To: ${to}
Subject: ${subject}
=========================================
${html.replace(/<[^>]*>/g, ' ')}
=========================================
      `);
      return { success: true, logged: true };
    }
  }

  try {
    const info = await transporter.sendMail({
      from: '"Darshan Ease" <noreply@darshanease.com>',
      to,
      subject,
      html,
    });

    console.log(`[Email] Mail sent: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email] Preview sent email at: ${previewUrl}`);
      return { success: true, previewUrl };
    }
    return { success: true };
  } catch (error) {
    console.error('[Email] Send failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate beautifully styled email HTML for booking confirmation/cancellation
 */
const getBookingEmailTemplate = (booking, ticket, user, isCancellation = false) => {
  const dateStr = new Date(booking.slotId.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const primaryColor = isCancellation ? '#ef4444' : '#f59e0b';
  const headerTitle = isCancellation ? 'Darshan Booking Cancelled' : 'Darshan Booking Confirmed!';
  const messageBody = isCancellation 
    ? 'We wish to confirm that your Darshan reservation has been cancelled. If a payment was made, your refund is being processed and will reflect in your account within 3-5 business days.'
    : 'Your priority entry slot has been successfully booked. Please find your ticket details and guidelines below. Present this ticket at the temple entry gate.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${headerTitle}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f7fafc; color: #2d3748; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background: linear-gradient(135deg, ${primaryColor} 0%, #d97706 100%); color: #ffffff; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; }
        .content { padding: 30px; }
        .lead-text { font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 24px; }
        .details-card { background: #fdfbf7; border: 1px solid #fef3c7; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .details-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .details-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #718096; }
        .value { font-weight: 700; color: #1a202c; text-align: right; }
        .ticket-box { background: #1a202c; color: #ffffff; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
        .ticket-code { font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #f59e0b; margin: 10px 0; }
        .tips-list { background: #f7fafc; border-left: 4px solid #718096; border-radius: 0 8px 8px 0; padding: 15px 20px; margin-bottom: 24px; }
        .tips-list h4 { margin: 0 0 8px 0; color: #4a5568; }
        .tips-list ul { margin: 0; padding-left: 20px; color: #718096; font-size: 14px; line-height: 1.5; }
        .footer { background: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #a0aec0; border-top: 1px solid #edf2f7; }
        .footer a { color: #f59e0b; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${headerTitle}</h1>
        </div>
        <div class="content">
          <p class="lead-text">Dear ${user.name},</p>
          <p class="lead-text">${messageBody}</p>
          
          <div class="details-card">
            <div class="details-row">
              <span class="label">Temple Shrinename</span>
              <span class="value">${booking.slotId.templeId.templeName}</span>
            </div>
            <div class="details-row">
              <span class="label">Location</span>
              <span class="value">${booking.slotId.templeId.location}</span>
            </div>
            <div class="details-row">
              <span class="label">Date of Entry</span>
              <span class="value">${dateStr}</span>
            </div>
            <div class="details-row">
              <span class="label">Darshan Slot Time</span>
              <span class="value">${booking.slotId.startTime} - ${booking.slotId.endTime}</span>
            </div>
            <div class="details-row">
              <span class="label">Amount Paid</span>
              <span class="value">₹${booking.totalAmount}</span>
            </div>
            <div class="details-row">
              <span class="label">Booking Status</span>
              <span class="value" style="color: ${isCancellation ? '#ef4444' : '#10b981'}">${booking.status}</span>
            </div>
          </div>

          ${!isCancellation && ticket ? `
          <div class="ticket-box">
            <div style="font-size: 12px; text-transform: uppercase; color: #a0aec0;">Digital Ticket Pass</div>
            <div class="ticket-code">${ticket.qrCode}</div>
            <div style="font-size: 11px; color: #a0aec0;">Show this code at the priority line counter</div>
          </div>
          ` : ''}

          <div class="tips-list">
            <h4>Important Guidelines</h4>
            <ul>
              <li>Please arrive 15 minutes prior to your allocated slot timing.</li>
              <li>Carry a valid government-issued photo ID card (Aadhaar, Passport, etc.).</li>
              <li>Ensure dress code standards of the shrine are respected.</li>
              <li>Keep a copy of this digital ticket ready on your mobile device.</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Darshan Ease. All rights reserved.</p>
          <p>For assistance, reply to this email or visit our <a href="#">Help Center</a>.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = {
  sendEmail,
  getBookingEmailTemplate
};
