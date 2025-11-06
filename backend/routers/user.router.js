const Router=require("express").Router();
const userController=require("../controllers/user.conrollers.js");
const auth = require('../middleware/auth.middleware.js');
const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' }); 
const fs=require('fs');

Router.get("/profile",auth,userController.getProfile);
Router.put("/profile/edit", upload.single('image') ,auth,userController.EditProfile);


// Router.put("/profile/edit", (req, res) => {
//   res.send("Test route working");
// });
module.exports=Router;