const Router = require("express").Router();
const authController = require("../controllers/auth.controllers");
const auth = require("../middleware/auth.middleware");
const {validateSignup,validateLogin} = require("../middleware/validation.middleware");
const rateLimit = require("express-rate-limit");
const {otpLimiter,loginLimiter} = require("../middleware/rateLimiter.middleware")

Router.post("/verify-email",validateSignup, authController.verifyEmail);
Router.post("/verify-otp",otpLimiter, authController.verifyOtp);
Router.post("/forgot-password",otpLimiter, authController.ForgotPassword);
Router.post("/reset-password/:token", authController.ResetPassword);
// Router.post("/reset-password-direct", authController.resetPasswordDirect); // TODO: DELETE in production
Router.get("/verify-token", auth, authController.verifyToken);
Router.post("/login",loginLimiter, authController.Login);
Router.post("/logout", auth,validateLogin, authController.Logout);
// Router.post("/dsignup", authController.dsignup); // TODO: DELETE in production

module.exports = Router;