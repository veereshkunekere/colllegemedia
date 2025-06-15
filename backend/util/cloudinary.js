const cloudinary=require('cloudinary').v2;
const dotenv=require('dotenv');
dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});     
const uploadImage = async (filePath,publicId=null) => {
    try {
        const options={
            folder: 'mvsrec',
            use_filename: true,
            unique_filename: false,
        }

        if(publicId) {
            options.public_id = publicId; // Set the public ID if provided  
        }

        const result = await cloudinary.uploader.upload(filePath, options);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw error;
    }
};
const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
};

const uploadPdf=async(filePath, publicId = null,category) => {
    try {   
        const options = {
            resource_type: 'raw', // Specify that this is a raw file (PDF)
            folder: `mvsrec/${category}`,
            use_filename: true,
            unique_filename: false,
        };

        if (publicId) {
            options.public_id = publicId; // Set the public ID if provided
        }

        const result = await cloudinary.uploader.upload(filePath, options);
        return result.secure_url;
    } catch (error) {
        console.error('Error uploading PDF to Cloudinary:', error);
        throw error;
    }
}   

module.exports = {
    uploadImage,
    deleteImage,
    uploadPdf
};
// This module provides functions to upload and delete images from Cloudinary.
// It uses the Cloudinary SDK to handle image uploads and deletions.

