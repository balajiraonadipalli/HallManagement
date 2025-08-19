const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "akashbalu2001@gmail.com",
    pass: "dvqr exxe bayy hcou"  
  }
});

const sendBookingMail = async ({ to, subject, text,html }) => {
  const mailOptions = {
    from: "akashbalu2001@gmail.com",
    to,
    subject,
    text,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendBookingMail;


