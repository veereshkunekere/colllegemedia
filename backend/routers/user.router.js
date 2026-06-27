const Router=require("express").Router();
const userController=require("../controllers/user.controllers.js");
const auth = require('../middleware/auth.middleware.js');
const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' }); 
const fs=require('fs');

Router.get("/profile",auth,userController.getProfile);
Router.put("/profile/edit",auth,upload.single('image') ,userController.EditProfile);
Router.put(
  "/public-key",
  auth,
  userController.updatePublicKey
);
Router.get("/public-key/:userId",auth,userController.getPublicKey);
Router.get("/search",auth,userController.searchUsers);
Router.get("/profile/:userId",auth,userController.getUserProfile);
Router.get("/:userId",auth,userController.getUserById);
// Router.put("/profile/edit", (req, res) => {
//   res.send("Test route working");
// });
module.exports=Router;