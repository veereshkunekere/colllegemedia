const adminCtrl={};
const Tweet=require("../models/tweet.models");
const User=require("../models/user.models");
const jwt=require("jsonwebtoken");

adminCtrl.deleteTweet=async (req, res) => {
    const tweetId = req.params.id;

    try {
        const tweet=await Tweet.findById(tweetId);
        const user = await User.findById(req.user);

        if (!user || user.role !== 'hod' || tweet.uploadedBy!==auth.id) {
            return res.status(403).json({ message: "Forbidden: Admins only" });
        }

        if(user.role==='hod'){
            if(tweet.reports.length<20){
                return res.status(201).json({message:'you cant remove tweet without 20 reports'})
            }else{
                const deleted = await Tweet.findByIdAndDelete(tweetId);
            }
        }
        if (!deleted) {
            return res.status(404).json({ message: "Tweet not found" });
        }

        return res.status(200).json({ message: "Tweet deleted by admin" });
    } catch (err) {
        console.error("Admin delete tweet error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports=adminCtrl