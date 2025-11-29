const nodemailer = require("nodemailer");

// Use Resend API directly (works on Render - no SMTP port blocking)
let Resend = null;
if (process.env.RESEND_API_KEY) {
  try {
    const { Resend: ResendClass } = require("resend");
    Resend = ResendClass;
    console.log('✅ Resend API initialized (using HTTPS - no port blocking)');
  } catch (error) {
    console.warn('⚠️ Resend package not installed, falling back to SMTP');
    console.warn('💡 Install with: npm install resend');
  }
}

// Gmail transporter for local development (fallback)
const gmailTransporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: process.env.GMAIL_USER || "akashbalu2001@gmail.com",
    pass: process.env.GMAIL_PASS || "psuh kzgd lsvt jfrd",
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Brevo (Sendinblue) transporter - works on Render, no recipient restrictions
let brevoTransporter = null;
if (process.env.BREVO_SMTP_KEY) {
  brevoTransporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.BREVO_SMTP_USER || process.env.BREVO_EMAIL,
      pass: process.env.BREVO_SMTP_KEY
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: {
      rejectUnauthorized: false
    }
  });
  console.log('✅ Brevo SMTP configured (300 free emails/day, no recipient restrictions)');
}

// Verify Gmail transporter (only for local development)
if (!process.env.RESEND_API_KEY && !process.env.BREVO_SMTP_KEY) {
  gmailTransporter.verify((error, success) => {
    if (error) {
      console.error('Gmail transporter verification failed:', error);
      console.warn('Server will continue running, but emails may not send');
    } else {
      console.log('✅ Gmail transporter ready (local development)');
    }
  });
}

// Helper function to send via Brevo
const sendViaBrevo = async ({ to, subject, text, html }) => {
  if (!brevoTransporter) {
    return { success: false, error: 'Brevo not configured. Set BREVO_SMTP_KEY in environment variables.' };
  }

  try {
    const fromEmail = process.env.BREVO_EMAIL || process.env.EMAIL_FROM || "akashbalu2001@gmail.com";
    console.log(`📧 Using Brevo SMTP to send email to: ${to}`);
    
    const info = await brevoTransporter.sendMail({
      from: fromEmail,
      to: to,
      subject: subject,
      html: html || text,
      text: text
    });

    console.log(`✅ Email sent successfully via Brevo to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email via Brevo to ${to}:`, error);
    return { success: false, error: error.message };
  }
};

const sendBookingMail = async ({ to, subject, text, html }) => {
  // Use Resend API if available (works on Render - no SMTP port blocking)
  if (process.env.RESEND_API_KEY && Resend) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
      console.log(`📧 Using Resend API to send email to: ${to}`);
      
      const resendClient = new Resend(process.env.RESEND_API_KEY);
      
      const { data, error } = await resendClient.emails.send({
        from: fromEmail,
        to: to,
        subject: subject,
        html: html || text,
        text: text
      });

      if (error) {
        // If Resend fails due to recipient restriction, try Brevo fallback
        if (error.statusCode === 403 && error.message?.includes('testing emails')) {
          console.warn(`⚠️ Resend restriction: Can only send to account owner. Trying Brevo fallback...`);
          return await sendViaBrevo({ to, subject, text, html });
        }
        console.error(`❌ Resend API error for ${to}:`, error);
        return { success: false, error: error.message || JSON.stringify(error) };
      }

      console.log(`✅ Email sent successfully via Resend API to ${to}. Message ID: ${data?.id}`);
      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error(`❌ Failed to send email via Resend API to ${to}:`, error);
      // Try Brevo fallback
      return await sendViaBrevo({ to, subject, text, html });
    }
  }

  // Try Brevo if configured (works on Render, no recipient restrictions)
  if (brevoTransporter) {
    return await sendViaBrevo({ to, subject, text, html });
  }

  // Fallback to Gmail SMTP (for local development only)
  const fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || "akashbalu2001@gmail.com";
  
  const mailOptions = {
    from: fromEmail,
    to,
    subject,
    text,
    html
  };

  try {
    console.log(`📧 Using Gmail SMTP to send email to: ${to}`);
    const info = await gmailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully via Gmail to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email via Gmail to ${to}:`, error);
    
    // Retry logic for transient failures
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.log(`🔄 Retrying email send to ${to}...`);
      try {
        const retryInfo = await gmailTransporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully on retry to ${to}. Message ID: ${retryInfo.messageId}`);
        return { success: true, messageId: retryInfo.messageId };
      } catch (retryError) {
        console.error(`❌ Retry failed for email to ${to}:`, retryError);
        return { success: false, error: retryError.message };
      }
    }
    
    return { success: false, error: error.message };
  }
};

// Function to send multiple emails in parallel
const sendMultipleEmails = async (emailList) => {
  try {
    const promises = emailList.map(emailData => sendBookingMail(emailData));
    const results = await Promise.allSettled(promises);
    
    const successful = results.filter(result => result.status === 'fulfilled' && result.value.success);
    const failed = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success));
    
    console.log(`Email batch completed: ${successful.length} successful, ${failed.length} failed`);
    
    return {
      successful: successful.length,
      failed: failed.length,
      results: results
    };
  } catch (error) {
    console.error('Error in sendMultipleEmails:', error);
    return { successful: 0, failed: emailList.length, error: error.message };
  }
};

module.exports = { sendBookingMail, sendMultipleEmails };


