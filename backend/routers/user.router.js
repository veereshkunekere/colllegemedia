const Router=require("express").Router();
const userController=require("../controllers/user.conrollers.js");
const auth = require('../middleware/auth.middleware.js');

Router.get("/profile",auth,userController.getProfile);
Router.put("/profile/edit",auth, userController.EditProfile);

module.exports=Router;