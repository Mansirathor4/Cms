// const nodemailer = require('nodemailer');

// const sendMail = async (to, subject, text) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.MAIL_ID,
//       pass: process.env.MAIL_PASSWORD
//     }
//   });

//   const mailOptions = {
//     from: process.env.MAIL_ID,
//     to,
//     subject,
//     text,
//   };

//   await transporter.sendMail(mailOptions);
// };
// module.exports = sendMail;

// util/sendMail.js
const nodemailer = require('nodemailer');

/**
 * Sends an email using Nodemailer.
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject line of the email.
 * @param {string} htmlContent - The HTML content for the email body.
 * @param {string} [textContent=''] - Optional plain text content for the email body (fallback for non-HTML clients).
 */
const sendMail = async (to, subject, htmlContent, textContent = '') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your preferred email service, e.g., 'SendGrid', 'Mailgun'
    auth: {
      user: process.env.MAIL_ID,     // Your email address from .env
      pass: process.env.MAIL_PASSWORD // Your email password or app-specific password from .env
    },
    tls: {
    rejectUnauthorized: false
  }
  });

  const mailOptions = {
    from: process.env.MAIL_ID, // Sender address
    to,                        // Recipient
    subject,                   // Subject line
    html: htmlContent,         // HTML body content
    text: textContent,         // Plain text body content (fallback/alternative)
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to} with subject: "${subject}"`);
  } catch (error) {
    console.error(`Error sending email to ${to} for subject "${subject}":`, error);
    // In a production application, you might want more robust error handling,
    // like logging to a file or a dedicated error tracking service.
  }
};

module.exports = sendMail;