const nodemailer = require("nodemailer");

// Create transporter with optimized configuration
// Uses Resend for production (Render), Gmail for local development
const transporter = nodemailer.createTransport(
  process.env.RESEND_API_KEY
    ? {
        // Resend configuration (for Render/production - works on cloud platforms)
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY
        }
      }
    : {
        // Gmail configuration (for local development only)
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
      }
);

// Verify transporter configuration (non-blocking)
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter verification failed:', error);
    console.warn('Server will continue running, but emails may not send');
  } else {
    console.log('Email transporter ready to send messages');
  }
});

const sendBookingMail = async ({ to, subject, text, html }) => {
  // Determine FROM email address
  let fromEmail;
  if (process.env.RESEND_API_KEY) {
    // If using Resend, use default domain if custom domain not verified
    // Resend default domain: onboarding@resend.dev (works without DNS verification)
    fromEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  } else {
    // Gmail fallback
    fromEmail = process.env.EMAIL_FROM || process.env.GMAIL_USER || "akashbalu2001@gmail.com";
  }
  
  const mailOptions = {
    from: fromEmail,
    to,
    subject,
    text,
    html
  };

  try {
    console.log(`Attempting to send email to: ${to}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    
    // Retry logic for transient failures
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.log(`Retrying email send to ${to}...`);
      try {
        const retryInfo = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully on retry to ${to}. Message ID: ${retryInfo.messageId}`);
        return { success: true, messageId: retryInfo.messageId };
      } catch (retryError) {
        console.error(`Retry failed for email to ${to}:`, retryError);
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


