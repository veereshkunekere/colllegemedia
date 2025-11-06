const Router=require("express").Router();
const authController=require("../controllers/auth.controllers");
const auth=require("../middleware/auth.middleware");

Router.post("/verify-email",authController.verifyEmail);
Router.post("/forgot-password",authController.ForgotPassword);
Router.post("/register/:token",authController.registerUser);
Router.post("/reset-password/:token",authController.ResetPassword);
Router.post("/reset-password-direct", authController.resetPasswordDirect);//TODO DELETE
Router.get("/verify-token",auth,authController.verifyToken);
Router.post("/login",authController.Login);
Router.post("/logout",auth,authController.Logout);
Router.post("/dsignup",authController.dsignup);//TODO delet

module.exports=Router;