
const transporter = require("../config/mail");

const sendOTPEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Verification Code",

    html: `
      <div style="font-family:Arial;padding:20px">
        <h2>Email Verification</h2>
        <p>Your OTP verification code is:</p>

        <h1 style="letter-spacing:8px;color:#2563eb">
          ${otp}
        </h1>

        <p>This OTP expires in 5 minutes.</p>
        <p>Please do not share this code with anyone.</p>
      </div>
    `,
  });

  console.log(`OTP email sent to ${email}`);
};

const sendWelcomeEmail = async (email) => {
  await transporter.sendMail({
    from: `"My App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to My App!",

    html: `
      <div style="font-family:Arial;padding:20px">
        <h1>Welcome! 🎉</h1>
        <p>Your email has been successfully verified.</p>
        <p>Thank you for joining us.</p>
      </div>
    `,
  });

  console.log(`Welcome email sent to ${email}`);
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
};
