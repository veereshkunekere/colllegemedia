const userController={};
const User=require("../models/user.models.js");
const jwt=require("jsonwebtoken");
const cloudinary=require("../util/cloudinary")
const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' }); 
const fs=require('fs');

userController.getProfile=async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-password'); // Exclude password from response
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        res.status(200).json({user});
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({message: "Unauthorized"});
    }
}

userController.EditProfile=upload.single('image') ,async (req, res) => {
    console.log("Updating profile with data:", req.body);
    try {
        const user = await User.findById(req.user); // Find the user by ID
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const username=req.body?.username;
        const email=req.body?.email;
        const bio=req.body?.bio;
        const link=req.body?.link;
        const profilePicture=req.file?req.file.path:null;
        console.log("Profile picture path:", profilePicture);
        if(username) user.username = username;
        if(email) user.email = email;
        if(bio) user.bio = bio;
        if(link) user.links=link;
        if(profilePicture){
           const result=await cloudinary.uploadImage(profilePicture,`user_${user._id}_avatar`);
           fs.unlinkSync(profilePicture); // Delete the local file after upload
           console.log("Profile picture uploaded to Cloudinary:", result);
            user.profilePicture = result; // Update profile picture URL
        }
        await user.save(); // Save updated user data
        console.log("User profile updated successfully:", user.profilePicture);
        res.status(200).json({message: "Profile updated successfully", user});
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

module.exports=userController;