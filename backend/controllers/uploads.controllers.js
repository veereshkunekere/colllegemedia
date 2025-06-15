const uploadsController={};
const User=require("../models/user.models");
const Upload=require("../models/upload.models");
const crypto=require("crypto");
const jwt=require("jsonwebtoken");
const multer = require('multer'); 
const fs=require('fs');

uploadsController.upload=async (req, res) => {
    const {title, description, category, department, batch, tags, fileType} = req.body; // Extract fields from request body
    console.log("Request body fields:", {title, description, category, department, batch, tags, fileType});

    if(!req.file || !title || !category || !department || !batch ){
        return res.status(400).json({message: "All fields are required"});  
    }

    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain'];
    if(!req.file.mimetype || !allowedFileTypes.includes(req.file.mimetype)){
        return res.status(400).json({message: "Invalid file type"});
        }
   

    try {
        const user = await User.findById(req.user); // Find the user by ID

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const fileExtension = req.file.originalname.split('.').pop().toLowerCase(); // Get the file extension
        const upload=new Upload({
            title: title,
            description: description,       
            category: category,
            department: department,
            batch: batch,
            tags: JSON.parse(tags), // Parse tags from JSON string to array
            fileType: fileType,
            fileExtension: fileExtension, // Store the file extension
            uploadedBy: user._id, // Associate the upload with the user
            fileUrl: '', // Placeholder for file URL, will be updated after upload
        })

        const uploadUrl = await cloudinary.uploadPdf(req.file.path, `upload_${upload._id}_document.${fileExtension}`,category); // Upload PDF to Cloudinary
        upload.fileUrl = uploadUrl; // Store the PDF URL in the upload document
        await upload.save(); // Save the upload document
        console.log("file path",req.file.path);
        console.log("file uploaded to Cloudinary:", uploadUrl);
        console.log("category", category);
        user.uploads[category].push(upload._id)// Add the PDF URL to user's documents array
        await user.save(); // Save updated user data

        fs.unlinkSync(req.file.path); // Delete the local file after upload

        res.status(200).json({message: "PDF uploaded successfully",});
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

uploadsController.getUserUploads=async (req,res)=>{   
   try {  
     const uploads=await Upload.find({uploadedBy:req.user});
    if(!uploads){
        console.log("no uploads")
        return res.status(200).json({message:"no uploads"});
    }
    console.log(uploads);
    return res.status(200).json({message:"uploades are sent",uploads})

   } catch (error) {
    
   }
}

uploadsController.getUploadByUploadId=async (req,res)=>{
   
   const id=req.params
   console.log("triked")
   
   try {
     const uploads=await Upload.findById(id)
    if(!uploads){
        console.log("no uploads")
        return res.status(200).json({message:"no uploads"});
    }
    console.log(uploads);
    return res.status(200).json({message:"uploades are sent",uploads})

   } catch (error) {
    
   }
}

uploadsController.getUploadsByCategeory= async (req, res) => {
    const category = req.params.cat;

    try {
        const uploads = await Upload.find({ category });
        return res.status(200).json({ message: "Category uploads fetched", uploads });
    } catch (error) {
        console.error("Error fetching by category:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

uploadsController.getUploadsByUserId= async (req, res) => {
    const userId = req.params.uid;
    try {
        const uploads = await Upload.find({ uploadedBy: userId });
        return res.status(200).json({ message: "User uploads fetched", uploads });
    } catch (error) {
        console.error("Error fetching by user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

uploadsController.deleteUploads= async (req, res) => {
    const id = req.params.id;

    try {

        const upload = await Upload.findById(id);
        if (!upload) {
            return res.status(404).json({ message: "Upload not found" });
        }

        // Optional: Allow deletion only if the upload belongs to the logged-in user
        if (upload.uploadedBy.toString() !== req.user) {
            return res.status(403).json({ message: "Forbidden" });
        }

        await Upload.findByIdAndDelete(id);
        return res.status(200).json({ message: "Upload deleted successfully" });

    } catch (error) {
        console.error("Error deleting upload:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports=uploadsController
