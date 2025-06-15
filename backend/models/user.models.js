const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        // required: true,
        // unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    links:[String],
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    verificationToken: {
        type: String,
        default: null
    },
    verificationExpires: {
        type: Date,
        default: null
    },
    profilePicture: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['student', 'teacher','hod','principal','alumini' ],
        default: 'student'
    },
    department: {
        type: String,
        enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'],
        // required:true
    },
    batch:{
        type: String,
        // required:true,
    },
    course: {
        type: String,
        enum: ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'PhD', 'Other'],
        // required:true,
    },
     uploads: {
            notes:[{
                type:mongoose.Schema.Types.ObjectId,
                ref:'Uploads',
            }],
            questionPaper:[{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Uploads'
            }],
            assignment: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Uploads'
            }],
            labManual: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Uploads'
            }],
            syllabus: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Uploads'
            }],
            other: [{
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Uploads'
            }]

    },
    isVerified:{
        type:Boolean,
        default: false,
        required:true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

UserSchema.pre('save',async function(next) {
   // Hash the password before saving the user document
    // Only hash the password if it has been modified (or is new)

   if(!this.isModified('password')) return next();
   
   try {
       const salt = await bcrypt.genSalt(10);
       this.password = await bcrypt.hash(this.password, salt);
       next();
   } catch (error) {
       next(error);
   }
}
);

module.exports=mongoose.model('User',UserSchema);