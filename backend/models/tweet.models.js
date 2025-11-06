const mongoose=require('mongoose');
const tweetSchema= new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 280 // Twitter's character limit
    },
    imageUrls: {
        type: [String],
        default: null
    },
    username:{
        type:String,
        required:true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:null
    }],
    isAnonymous:{
        type:Boolean,
        require:true
    },
    reports:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }],
    comments:[{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Tweet = mongoose.model('Tweet', tweetSchema);
module.exports = Tweet;