
const User = require("../models/User");

const { redis } = require("../config/redis");
const { publishToQueue } = require("../config/rabbitmq");

const {
  generateOTP,
  hashOTP,
  verifyOTP: checkOTP,
} = require("../utils/otp");

const jwt = require("jsonwebtoken");

const OTP_TTL = Number(process.env.OTP_EXPIRES_IN || 300);
const MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const cooldownKey = `otp:cooldown:${email}`;
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp:attempts:${email}`;

    // Prevent frequent OTP requests
    const cooldown = await redis.get(cooldownKey);

    if (cooldown) {
      return res.status(429).json({
        success: false,
        message: "Please wait before requesting another OTP",
      });
    }

    const otp = generateOTP();
    const hashedOTP = hashOTP(otp, email);

    // Store hashed OTP for 5 minutes
    await redis.set(otpKey, hashedOTP, {
      EX: OTP_TTL,
    });

    await redis.del(attemptsKey);

    // 60-second resend cooldown
    await redis.set(cooldownKey, "1", {
      EX: 60,
    });

    try {
      // Publish email job to RabbitMQ
      await publishToQueue({
        type: "OTP",
        email,
        otp,
      });
    } catch (error) {
      await redis.del(otpKey);
      await redis.del(cooldownKey);

      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "OTP request queued successfully",
      expiresIn: OTP_TTL,
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP",
    });
  }
};


// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const otp = String(req.body.otp || "");

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP required",
      });
    }

    const otpKey = `otp:${email}`;
    const attemptsKey = `otp:attempts:${email}`;

    const storedHash = await redis.get(otpKey);

    if (!storedHash) {
      return res.status(400).json({
        success: false,
        message: "OTP expired or not found",
      });
    }

    // Count incorrect attempts
    const attempts = await redis.incr(attemptsKey);

    if (attempts === 1) {
      await redis.expire(attemptsKey, OTP_TTL);
    }

    if (attempts > MAX_ATTEMPTS) {
      await redis.del(otpKey);
      await redis.del(attemptsKey);

      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    if (!checkOTP(otp, email, storedHash)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        remainingAttempts: MAX_ATTEMPTS - attempts,
      });
    }

    // OTP successfully verified
    await redis.del(otpKey);
    await redis.del(attemptsKey);

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      try {
        user = await User.create({
          email,
          isVerified: true,
          verifiedAt: new Date(),
        });

        isNewUser = true;
      } catch (error) {
        // Handle simultaneous registration requests
        if (error.code !== 11000) throw error;
        user = await User.findOne({ email });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send welcome email only for new users
    if (isNewUser) {
      await publishToQueue({
        type: "WELCOME",
        email: user.email,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
};
