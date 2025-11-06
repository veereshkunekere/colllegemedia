const uploadsController={};
const User=require("../models/user.models");
const Upload=require("../models/upload.models");
const crypto=require("crypto");
const jwt=require("jsonwebtoken");
const multer = require('multer'); 
const fs=require('fs');
const cloudinary=require("../util/cloudinary")
const {uploadImage,uploadPdf}=require("../util/cloudinary")

uploadsController.upload = async (req, res) => {
    console.log("File:", req.file);
    console.log("Body:", req.body);

    // --- Extract fields ---
    const {
        title,
        description,
        category,
        department,
        batch,
        tags: tagsJson,
        fileType
    } = req.body;

    // --- Required fields ---
    if (!req.file || !title || !category || !department || !batch) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    // --- Parse tags safely ---
    let tags = [];
    try {
        tags = tagsJson ? JSON.parse(tagsJson) : [];
        if (!Array.isArray(tags)) tags = [];
    } catch (err) {
        return res.status(400).json({ message: "Invalid tags format" });
    }

    try {
        // --- Find user ---
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // --- Get file extension ---
        const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

        // --- Create Upload document ---
        const uploadDoc = new Upload({
            title,
            description: description || "",
            category,
            department,
            batch,
            tags,
            fileType,
            fileExtension,
            uploadedBy: user._id,
            fileUrl: '' // will be set after Cloudinary upload
        });

        // --- Upload to Cloudinary ---
        let fileUrl;
        const publicId = `upload_${uploadDoc._id}_${Date.now()}`;

        if (fileType === 'pdf' || req.file.mimetype === 'application/pdf') {
            fileUrl = await uploadPdf(req.file.path, publicId, category);
        } else {
            // For images, docs, pptx — treat as raw or image
            fileUrl = await uploadImage(req.file.path, publicId);
        }

        uploadDoc.fileUrl = fileUrl;
        await uploadDoc.save();

        // --- Update user's uploads[category] ---
        if (!user.uploads[category]) {
            user.uploads[category] = [];
        }
        user.uploads[category].push(uploadDoc._id);
        await user.save();

        // --- Cleanup local file ---
        fs.unlinkSync(req.file.path);

        // --- Success ---
        return res.status(200).json({
            message: "File uploaded successfully",
            fileUrl,
            uploadId: uploadDoc._id
        });

    } catch (error) {
        console.error("Upload error:", error);
        // Optional: delete partial upload from Cloudinary
        return res.status(500).json({ message: "Upload failed" });
    }
};

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
