const User=require("../models/user.models");
const crypto=require("crypto");
const jwt=require("jsonwebtoken");
const Tweet=require("../models/tweet.models");
const multer = require('multer'); 
const upload = require("../middleware/upload"); 
const fs=require('fs');
const tweetController={};
const {uploadImage}=require("../util/cloudinary")
const path=require("path");

tweetController.makeAtweet = async (req, res) => {
   
    try {
        // 1. Validate user
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Body
        const { content, isAnonymus } = req.body;
        if (!content || content.length > 280)
            return res.status(400).json({ message: "Content required ≤ 280 chars" });

        const isAnonymous = isAnonymus === "true";

        // 4. Create tweet (no images yet)
        const tweet = new Tweet({
            content,
            userId: user._id,
            username: user.username,
            isAnonymous,
            imageUrls: [],          // will be filled below
            reports: [],
            comments: [],
            likes:[]
        });

       if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const publicId = `tweet_${tweet._id}_${Date.now()}`;
                const url = await uploadImage(file.path, publicId);
                tweet.imageUrls.push(url);
                fs.unlinkSync(file.path); // cleanup
            }
        }

        // 6. Save
        const savedTweet = await tweet.save();
        console.log("Tweet saved:", savedTweet);

        return res.status(200).json({ message: "Tweet posted", savedTweet });

    } catch (error) {
        console.error("Error posting tweet:", error);
        // optional: clean up already-uploaded Cloudinary images on failure
        return res.status(500).json({ message: "Internal server error" });
    }
};


tweetController.getTweets=async (req,res)=>{
    // console.log("triggered tweetfeed")
    const token=req.cookies.token;
    if(!token){
        return res.status(201).json({message:"unauthorized user"});
    }
    const decode=jwt.verify(token,process.env.JWT_SECRET);
    const user=await User.findById(decode.id);
    if(!user){
        return res.status(201).json({message:"user not found"});
    }
    let data=await Tweet.find({});
    data=data.map((t)=>{
        const tweet=t.toObject();
        if(tweet.isAnonymous){
            tweet.userId=null;
            tweet.username=null;
        }
        return tweet;
    })
    // console.log(data);
    res.status(200).json({message:"feed",data,user})
}

tweetController.likeATweet=async (req,res)=>{
    console.log(req.body)
    const tweetid=req.body.id
   
    try {
        const user = await User.findById(req.user); // Find the user by ID
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        console.log(user);
        const tweet=await Tweet.findById(tweetid);
        console.log("tweet befor updation",tweet)
        if(!tweet.likes.includes(user._id)){
           tweet.likes.push(user._id);
        }else(
            tweet.likes=tweet.likes.filter((usr)=>usr.toString()!==user._id.toString())
        )
        await tweet.save();
        console.log(tweet);
        res.status(200).json({message: "Tweet posted successfully", tweet});
    } catch (error) {
        console.error("Error posting tweet:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

tweetController.reportTweet=async (req,res)=>{
    const {id,userId}=req.body;
     console.log("reported",id,"by",userId)
   
    try {
         const user = await User.findById(req.user); // Find the user by ID
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        console.log(user);
        const tweet=await Tweet.findById(id);
        tweet.reports.push(userId);
        await tweet.save();
        res.status(200).json({ message: "Tweet reported", tweet });
        console.log(tweet);
    } catch (error) {
        
    }
}

module.exports=tweetController;
