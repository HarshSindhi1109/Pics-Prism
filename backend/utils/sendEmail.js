const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Your OTP Verification Code",
    html: `
      <h2>OTP Verification</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>Valid for 1 minute</p>
    `,
  });
};

exports.sendSellerApprovalEmail = async (email, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Seller Account Approved 🎉",
    html: `
      <h2>Hello ${name},</h2>
      <p>Your request to become a seller has been <b>approved</b>.</p>
      <p>You can now login using the link below:</p>
      <a href="http://localhost:3000/seller-login">
        Seller Login
      </a>
      <br/><br/>
      <p>Welcome to our seller community</p>
    `,
  });
};

exports.sendSellerRejectionEmail = async (email, name, reason) => {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: email,
    subject: "Seller Application Update",
    html: `
      <h2>Hello ${name},</h2>

      <p>Your seller application has been <b>rejected</b>.</p>

      <p><b>Reason for rejection:</b></p>
      <blockquote style="background:#f5f5f5;padding:10px;border-left:4px solid red;">
        ${reason}
      </blockquote>

      <p>
        You may correct the above issue and apply again.
      </p>

      <br/>
      <p>Regards,<br/>Pics Prism Team</p>
    `,
  });
};

exports.sendContactReplyEmail = async (to, subject, reply) => {
  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL}>`,
    to,
    subject: `Re: ${subject}`,
    html: `
      <h2>Support Reply</h2>
      <p>${reply}</p>
      <br/>
      <p>Regards, <br/>Pics Prism Support Team</p>
    `,
  });
};
