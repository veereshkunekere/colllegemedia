const User = require("../models/user.models");
const crypto = require("crypto");
const transporter = require("../util/nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const authController = {};

// ─── VERIFY EMAIL (Signup step 1) ────────────────────────────────────────────
// Creates an unverified user (publicKey: null) and sends OTP.
// No key generation happens here — keys are generated on the OTP screen.
authController.verifyEmail = async (req, res) => {
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
    const pendingUser = await User.findOne({ email, isVerified: false });
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

    try {
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
            await transporter.sendMail({
                to: newUser.email,
                subject: "Email verification",
                text: `Your verification OTP is: ${verificationOtp}`,
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
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
authController.Logout = (req, res) => {
    res.clearCookie("token");
    return res.status(200).json({ message: "Logged out successfully" });
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
authController.ForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const message = `To reset your password, make a request to: \n\n${resetUrl}`;

    try {
        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset Request",
            text: message,
        });
        return res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        console.error("Error sending reset email:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─── RESET PASSWORD ───────────────────────────────────────────────────────────
authController.ResetPassword = async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and password are required" });
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    try {
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