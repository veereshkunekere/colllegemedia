const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
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
    links: [String],

    // ─── PASSWORD RESET (OTP → short-lived JWT reset token) ────────────────
    // resetPasswordOtp is cleared as soon as it's verified (one-time use).
    // resetPasswordOtpVerified guards ResetPassword so a reset_token can
    // only be redeemed once, even though the JWT itself stays valid for
    // its full 5-minute window.
    resetPasswordOtp: {
        type: String,
        default: null
    },
    resetPasswordOtpExpires: {
        type: Date,
        default: null
    },
    resetPasswordOtpVerified: {
        type: Boolean,
        default: false
    },
    // Any JWT issued before this timestamp is rejected by auth.middleware —
    // this is what "logs out other sessions" after a password reset.
    passwordChangedAt: {
        type: Date,
        default: null
    },

    verificationOtp: {
        type: String,
        default: null
    },
    verificationOtpExpires: {
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
        enum: ['student', 'teacher', 'hod', 'principal', 'alumini'],
        default: 'student'
    },
    department: {
        type: String,
        enum: ['CSE', 'ECE', 'EEE', 'ME', 'CE', 'IT', 'Other'],
        required: true
    },
    batch: {
        type: String,
        required: true,
    },
    course: {
        type: String,
        enum: ['B.Tech', 'M.Tech', 'MBA', 'MCA', 'PhD', 'Other'],
        required: true,
    },
    uploads: {
        notes: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Uploads',
        }],
        questionPaper: [{
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
    isVerified: {
        type: Boolean,
        default: false,
    },
    // publicKey is null for unverified users; required once isVerified = true
    publicKey: {
        type: String,
        required: function () {
            return this.isVerified;
        }
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

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Auto-expire unverified users when their OTP expires
UserSchema.index(
    { verificationOtpExpires: 1 },
    {
        expireAfterSeconds: 0,
        partialFilterExpression: {
            isVerified: false
        }
    }
);

module.exports = mongoose.model('User', UserSchema);