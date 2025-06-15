const mongoose=require('mongoose');
const uploadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    
    fileUrl: { type: String, required: true },
    fileType: {
        type: String,
        enum: ['pdf', 'image', 'doc', 'ppt', 'other'],
        default: 'pdf',
    },

    // Differentiates type of content
    category: {
        type: String,
        enum: ['notes', 'questionPaper', 'labManual', 'assignment', 'syllabus', 'other'],
        required: true,
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    department: { 
        type: String,
        enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'], 
        required: true 
    },
    batch: { type: String, required: true },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
});
const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;    