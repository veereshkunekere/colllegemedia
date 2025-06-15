const User=require("../models/user.models");
const crypto=require("crypto");
const jwt=require("jsonwebtoken");
const Tweet=require("../models/tweet.models");
const multer = require('multer'); 
const upload = multer({ dest: 'uploads/' }); 
const fs=require('fs');
const tweetController={};

tweetController.makeAtweet=async (req, res) => {
     // Get the token from cookies
    console.log(req.file)
   
     const allowedFileTypes = ['image/jpeg', 'image/png', 'image/webp', ];
    try {
        const user = await User.findById(req.user); // Find the user by ID
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const {content,isAnonymus,image} = req.body; // Extract content from request body

        if(!req.file.mimetype || !allowedFileTypes.includes(req.file.mimetype)){
            return res.status(400).json({message: "Invalid file type"});
        }

        if(!content || content.length > 280){
            return res.status(400).json({message: "Content is required and must be less than 280 characters"});
        }
        console.log(user);
        const tweet = new Tweet({
            content: content,
            userId: user._id, // Associate the tweet with the user
            comments:null,
            username:user.username,
            isAnonymous:isAnonymus,
            reports:[]
        });
        const fileExtension=req.file.originalname.split(".").pop().toLowerCase();
        const ImageUrl=await cloudinary.uploadImage(req.file.path,`tweet_${tweet._id}.${fileExtension}`);
        tweet.imageUrl=ImageUrl;
        console.log(tweet);
        const savedTweet = await tweet.save(); // Save the tweet document
        console.log("Tweet saved successfully:", savedTweet);

        fs.unlinkSync(req.file?.path)

        res.status(200).json({message: "Tweet posted successfully", savedTweet});
    } catch (error) {
        console.error("Error posting tweet:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

tweetController.getTweets=async (req,res)=>{
    console.log("triggered tweetfeed")
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
