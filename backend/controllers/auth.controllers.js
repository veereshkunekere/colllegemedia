const User = require("../models/user.models");
const crypto = require("crypto");
const sendMail = require("../util/sendMail");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
    return crypto.createHash("sha256").update(otp).digest("hex");
}

const authController = {};

// ─── VERIFY EMAIL (Signup step 1) ────────────────────────────────────────────
// Creates an unverified user (publicKey: null) and sends OTP.
// No key generation happens here — keys are generated on the OTP screen.
authController.verifyEmail = async (req, res) => {   

    try {
        
         const {
        username,
        email,
        password,
        role,
        department,
        batch,
        course,
    } = req.body;

    // Reject if a verified account already exists for this email
    const verifiedExists = await User.findOne({ email, isVerified: true });
    if (verifiedExists) {
        return res.status(400).json({ message: "User already exists with this email" });
    }

    // If an unverified record exists and its OTP is still valid, tell the
    // client there is no need to resend — just use the existing OTP window.
    const pendingUser = await User.findOne({ email, isVerified: false }).select("-password -verificationOtp");
    if (pendingUser && pendingUser.verificationOtpExpires > Date.now()) {
        // Return the pending user so the frontend can store it in state
        return res.status(201).json({
            message: "Verification email already sent",
            user: pendingUser,
        });
    } else if (pendingUser) {
        // Stale unverified record — remove it so we can create a fresh one
        await User.deleteOne({ email, isVerified: false });
    }
        // publicKey is intentionally null until OTP is verified
        const newUser = new User({
            username,
            email,
            password,
            role,
            department,
            batch,
            course,
            publicKey: null,   // ← no key at signup
            isVerified: false,
        });

        const verificationOtp = generateOtp();
        newUser.verificationOtp = verificationOtp;
        newUser.verificationOtpExpires = Date.now() + 600000; // 10 minutes

        await newUser.save();

        // Send OTP email
        try {
            await sendMail({
                to: newUser.email,
                subject: "Email verification",
                html: `<p>Your verification OTP is: ${verificationOtp}</p>`,
            });
        } catch (mailError) {
            await User.deleteOne({ _id: newUser._id });
            console.error("Error sending verification email:", mailError);
            return res.status(500).json({ message: "Error sending verification email" });
        }

        // Return the saved user so the frontend can keep userId in state
        // (needed for key generation keyed to userId, not email)
        return res.status(200).json({
            message: "OTP sent to email",
            user: newUser,
        });
    } catch (error) {
        console.error("Error in verifyEmail:", error);
        return res.status(500).json({ message: "Error initiating email verification" });
    }
};

// ─── VERIFY OTP (Signup step 2) ──────────────────────────────────────────────
// Receives publicKey from the frontend (generated on the OTP screen),
// saves it together with isVerified = true, and returns a JWT.
authController.verifyOtp = async (req, res) => {
    try {

         const { email, otp, publicKey } = req.body;

    if (!publicKey) {
        return res.status(400).json({ message: "Public key required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    // Prevent double-verification
    if (user.isVerified) {
        return res.status(400).json({ message: "User already verified" });
    }

    if (user.verificationOtp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.verificationOtpExpires < Date.now()) {
        return res.status(400).json({ message: "OTP expired" });
    }

    // Atomically save publicKey + isVerified in one save() call
    user.publicKey = publicKey;
    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    // Strip password before responding
    user.password = undefined;

    return res.status(200).json({ message: "Email verified successfully", token, user });
        
    } catch (error) {
        console.log("error at verifyEmail",error);
        return res.status(500).json({message:"serverside error"});
    }
   
};

// ─── VERIFY TOKEN ─────────────────────────────────────────────────────────────
authController.verifyToken = async (req, res) => {
    try {
        const user = await User.findById(req.user).select("-password");
        if (user) {
            return res.status(200).json({ data: "authorized", user });
        }
        return res.status(401).json({ data: "unauthorized", user: null });
    } catch (err) {
        return res.status(401).json({ message: "Token invalid or expired" });
    }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Existing login behaviour is unchanged.
authController.Login = async (req, res) => {
   try {
     const { email, password } = req.body;
    console.log("Login attempt for email:", email);
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
        return res.status(403).json({ message: "Please verify your email first" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid password" });
    }

    user.password = undefined;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.cookie("token", token, {
        expires: new Date(Date.now() + 24 * 3600000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    return res.status(200).json({ message: "Login successful", token, user });
   } catch (error) {
    console.log("error in login",error);
     return res.status(500).json({message:"server side error"})
   }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
authController.Logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
};

// ─── FORGOT PASSWORD (reset step 1) ──────────────────────────────────────────
// Generates an OTP, stores its hash + a 10-minute expiry, emails the plain
// OTP to the user. Always responds with the same message regardless of
// whether the account exists, to avoid leaking which emails are registered.
authController.ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const genericResponse = {
            message: "If an account exists for this email, a reset OTP has been sent",
        };

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json(genericResponse);
        }

        const otp = generateOtp();

        user.resetPasswordOtp = hashOtp(otp);
        user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.resetPasswordOtpVerified = false;
        await user.save();

        try {
            await sendMail({
                to: user.email,
                subject: "Password Reset OTP",
                html: `<p>Your password reset OTP is: ${otp}. It expires in 10 minutes.</p>`,
            });
        } catch (mailError) {
            console.error("Error sending reset OTP email:", mailError);
            return res.status(500).json({ message: "Error sending reset email" });
        }

        return res.status(200).json(genericResponse);
    } catch (error) {
        console.log("error in forgotPassword", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── VERIFY RESET OTP (reset step 2) ─────────────────────────────────────────
// Validates the OTP, marks it consumed (one-time use), and issues a
// short-lived JWT reset token that ResetPassword will require.
authController.VerifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ email });

        if (!user || !user.resetPasswordOtp) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        if (user.resetPasswordOtpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        if (hashOtp(otp) !== user.resetPasswordOtp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Consume the OTP immediately so it can't be reused
        user.resetPasswordOtp = null;
        user.resetPasswordOtpVerified = true;
        await user.save();

        const resetToken = jwt.sign(
            { id: user._id, purpose: "password_reset" },
            process.env.JWT_SECRET,
            { expiresIn: "5m" }
        );

        return res.status(200).json({ message: "OTP verified", resetToken });
    } catch (error) {
        console.log("error in verifyResetOtp", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── RESET PASSWORD (reset step 3) ───────────────────────────────────────────
// Requires the short-lived resetToken from VerifyResetOtp, not a URL param.
// Also requires resetPasswordOtpVerified to still be true, so the same
// reset_token can't be redeemed twice even within its 5-minute JWT window.
authController.ResetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({ message: "Reset token and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters long" });
        }

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        if (decoded.purpose !== "password_reset") {
            return res.status(400).json({ message: "Invalid reset token" });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (!user.resetPasswordOtpVerified) {
            return res.status(400).json({ message: "Reset token already used or invalid" });
        }

        user.password = newPassword; // hashed by the pre-save hook
        user.resetPasswordOtpVerified = false;
        user.resetPasswordOtpExpires = null;
        user.passwordChangedAt = new Date(); // invalidates existing JWTs — see auth.middleware.js

        await user.save();

        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Error resetting password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── RESET PASSWORD DIRECT (TODO: remove in production) ──────────────────────
authController.resetPasswordDirect = async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });
        user.password = newPassword;
        await user.save();
        return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── DSIGNUP (TODO: delete in production) ─────────────────────────────────────
authController.dsignup = async (req, res) => {
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
    await user.save();
    return res.status(200).json({ message: "Dev signup done" });
};

module.exports = authController;