const Router = require("express").Router();
const authController = require("../controllers/auth.controllers");
const auth = require("../middleware/auth.middleware");

Router.post("/verify-email", authController.verifyEmail);
Router.post("/verify-otp", authController.verifyOtp);
Router.post("/forgot-password", authController.ForgotPassword);
Router.post("/reset-password/:token", authController.ResetPassword);
Router.post("/reset-password-direct", authController.resetPasswordDirect); // TODO: DELETE in production
Router.get("/verify-token", auth, authController.verifyToken);
Router.post("/login", authController.Login);
Router.post("/logout", auth, authController.Logout);
Router.post("/dsignup", authController.dsignup); // TODO: DELETE in production

module.exports = Router;