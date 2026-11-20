
import express from "express";
import Redis from "ioredis";
import dotenv from "dotenv";
import crypto from "node:crypto";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10kb" }));

const redis = new Redis(
    process.env.REDIS_URL || "redis://localhost:6379"
);

const PORT = process.env.PORT || 3000;

const OTP_TTL = 300;       // 5 minutes
const RESEND_COOLDOWN = 60; // 60 seconds
const MAX_ATTEMPTS = 5;

// Secret used to hash OTP
if (!process.env.OTP_SECRET) {
    throw new Error("OTP_SECRET is required");
}

// Redis keys
const otpKey = (phone) => `otp:${phone}`;
const attemptsKey = (phone) => `otp:attempts:${phone}`;
const cooldownKey = (phone) => `otp:cooldown:${phone}`;

// Generate HMAC hash of OTP
function hashOTP(otp) {
    return crypto
        .createHmac("sha256", process.env.OTP_SECRET)
        .update(otp)
        .digest("hex");
}

// Placeholder for SMS provider integration
async function sendSMS(phone, otp) {
    // Integrate Twilio or another SMS gateway here.
    // Never log or return the OTP in production.

    console.log(`SMS provider should send OTP to ${phone}`);

    // Replace this with your real SMS provider call.
}

// Generate OTP
app.post("/otp", async (req, res) => {
    try {
        const { phone } = req.body;

        // Validate phone number in E.164 format
        if (
            typeof phone !== "string" ||
            !/^\+[1-9]\d{7,14}$/.test(phone)
        ) {
            return res.status(400).json({
                message: "Enter a valid phone number with country code"
            });
        }

        // Prevent repeated OTP requests
        const cooldown = await redis.set(
            cooldownKey(phone),
            "1",
            "EX",
            RESEND_COOLDOWN,
            "NX"
        );

        if (cooldown !== "OK") {
            const ttl = await redis.ttl(cooldownKey(phone));

            return res.status(429).json({
                message: "Please wait before requesting another OTP",
                retryAfter: ttl
            });
        }

        // Generate cryptographically secure OTP
        const otp = crypto
            .randomInt(100000, 1000000)
            .toString();

        // Store hash instead of plain OTP
        const hashedOTP = hashOTP(otp);

        await redis
            .multi()
            .set(otpKey(phone), hashedOTP, "EX", OTP_TTL)
            .set(attemptsKey(phone), "0", "EX", OTP_TTL)
            .exec();

        try {
            // Send OTP using SMS provider
            await sendSMS(phone, otp);

        } catch (error) {
            await redis
                .multi()
                .del(
                    otpKey(phone),
                    attemptsKey(phone),
                    cooldownKey(phone)
                )
                .exec();

            throw error;
        }

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            expiresIn: OTP_TTL
        });

    } catch (error) {
        console.error("OTP generation error:", error.message);

        res.status(500).json({
            message: "Unable to send OTP"
        });
    }
});

// Atomic OTP verification using Lua
const verifyScript = `
    local saved = redis.call('GET', KEYS[1])

    if not saved then
        return -1
    end

    local attempts = tonumber(
        redis.call('GET', KEYS[2]) or '0'
    )

    if attempts >= tonumber(ARGV[2]) then
        return -2
    end

    if saved ~= ARGV[1] then
        local count = redis.call('INCR', KEYS[2])

        if count >= tonumber(ARGV[2]) then
            redis.call('DEL', KEYS[1])
            return -2
        end

        return 0
    end

    redis.call('DEL', KEYS[1], KEYS[2])

    return 1
`;

// Verify OTP
app.post("/otp/verify", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (
            typeof phone !== "string" ||
            !/^\+[1-9]\d{7,14}$/.test(phone) ||
            typeof otp !== "string" ||
            !/^\d{6}$/.test(otp)
        ) {
            return res.status(400).json({
                message: "Invalid phone number or OTP format"
            });
        }

        const hashedOTP = hashOTP(otp);

        // Compare and delete in one atomic Redis operation
        const result = await redis.eval(
            verifyScript,
            2,
            otpKey(phone),
            attemptsKey(phone),
            hashedOTP,
            MAX_ATTEMPTS
        );

        if (result === -1) {
            return res.status(400).json({
                message: "OTP expired or not found"
            });
        }

        if (result === -2) {
            return res.status(429).json({
                message: "Maximum OTP attempts reached. Request a new OTP."
            });
        }

        if (result === 0) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        res.json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        console.error("OTP verification error:", error.message);

        res.status(500).json({
            message: "Unable to verify OTP"
        });
    }
});

// Check remaining OTP time
app.get("/otp/:phone/ttl", async (req, res) => {
    try {
        const phone = req.params.phone;

        if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
            return res.status(400).json({
                message: "Invalid phone number"
            });
        }

        const ttl = await redis.ttl(otpKey(phone));

        res.json({
            expiresIn: ttl,
            active: ttl > 0
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to check OTP expiration"
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
