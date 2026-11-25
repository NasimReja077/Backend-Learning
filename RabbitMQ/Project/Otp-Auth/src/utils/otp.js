
const crypto = require("crypto");

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// Hash OTP using a server-side secret
const hashOTP = (otp, email) => {
  return crypto
    .createHmac("sha256", process.env.OTP_SECRET)
    .update(`${email}:${otp}`)
    .digest("hex");
};

const verifyOTP = (otp, email, storedHash) => {
  const inputHash = Buffer.from(hashOTP(otp, email), "hex");
  const savedHash = Buffer.from(storedHash, "hex");

  return (
    inputHash.length === savedHash.length &&
    crypto.timingSafeEqual(inputHash, savedHash)
  );
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
};
