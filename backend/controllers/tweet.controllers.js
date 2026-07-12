const User=require("../models/user.models");
const Tweet=require("../models/tweet.models");
const fs=require('fs');
const tweetController={};
const {uploadImage}=require("../util/cloudinary")
const mongoose =require("mongoose");

tweetController.makeAtweet = async (req, res) => {
   
    try {

      if(req.files && req.files.length > 1){
        return res.status(400).json({message: "Maximum 1 image allowed"});
      }
        // 1. Validate user
        const user = await User.findById(req.user);
        if (!user) return res.status(404).json({ message: "User not found" });

        // 2. Body
        const { content, isAnonymous } = req.body;
        if (!content || content.length > 280)
            return res.status(400).json({ message: "Content required ≤ 280 chars" });

        // 4. Create tweet (no images yet)
        const tweet = new Tweet({
            content,
            userId: user._id,
            username: user.username,
            isAnonymous: isAnonymous === "true",
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
        savedTweet.likesCount = 0;
        savedTweet.likedByUser = false;
        savedTweet.commentsCount = 0;
        console.log("Tweet saved:", savedTweet);

        return res.status(200).json({ message: "Tweet posted", savedTweet });

    } catch (error) {
        console.error("Error posting tweet:", error);
        if (req.files) {
    req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    });
}
        // optional: clean up already-uploaded Cloudinary images on failure
        return res.status(500).json({ message: "Internal server error" });
    }
};


tweetController.getTweets=async (req,res)=>{
    try {
      const limit = 10;

      const cursor = req.query.cursor;

      console.log("Fetching tweets with cursor:", cursor);
      let query = {};

      if (
    cursor &&
    !mongoose.Types.ObjectId.isValid(cursor)
) {
    return res.status(400).json({
        message: "Invalid cursor"
    });
}

      if (cursor) {
        query._id = {
          $lt:
            new mongoose.Types.ObjectId(
              cursor
            ),
        };
      }

      const posts = await Tweet.find(query).populate(
            "userId",
            "username profilePicture"
          ).sort({
            _id: -1,
          })
          .limit(limit);

      const nextCursor =
        posts.length === limit
          ? posts[
              posts.length - 1
            ]._id
          : null;

      const formattedPosts = posts.map((post) => (
        {
           _id: post._id,
           content: post.content,

        createdAt:
           post.createdAt,

        isAnonymous:
           post.isAnonymous,

        username:
          post.isAnonymous
        ? "Anonymous"
        : post.userId?.username,

        profilePicture:
          post.userId
            ?.profilePicture ||
          null,

        likesCount:
            post.likes?.length || 0,
        
        likedByUser:
            post.likes.some((id) =>
               id.toString() ===
               req.user.toString()
            ),

        commentsCount:
           post.comments?.length || 0,

        imageUrls:
           post.imageUrls,
        
  }));

res.status(200).json({
  posts: formattedPosts,

  nextCursor,

  hasMore:
    posts.length === limit,
});
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Error fetching feed",
      });
    }
}

tweetController.getTweetsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;
 
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
 
        let tweets = await Tweet.find({ userId, isAnonymous: { $ne: true } })
            .sort({ createdAt: -1 });
 
        tweets = tweets.map((t) => t.toObject());
 
        return res.status(200).json({ message: "User posts fetched", tweets });
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

tweetController.likeATweet=async (req,res)=>{
    console.log(req.body)
    const tweetid=req.body.id
   
    try {
        const user = await User.findById(req.user); // Find the user by ID
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        const tweet=await Tweet.findById(tweetid);
        if(!tweet){
           return res.status(404).json({
        message: "Tweet not found"
    });
        }
        const alreadyLiked =tweet.likes.some(id =>
         id.toString() ===
         user._id.toString()
        );
        if(!alreadyLiked){
           tweet.likes.push(user._id);
        }else(
            tweet.likes=tweet.likes.filter((usr)=>usr.toString()!==user._id.toString())
        )
        await tweet.save();
        res.status(200).json({
          success: true,
          tweetId: tweet._id,
          likesCount:tweet.likes.length,
          likedByUser:tweet.likes.some((id) =>
            id.toString() ===
            user._id.toString()
          )
        });
    } catch (error) {
        console.error("Error posting tweet:", error);
        res.status(500).json({message: "Internal server error"});
    }
}

tweetController.addComment =async (req, res) => {
    try {
      const { tweetId, content } =
        req.body;

      if (
        !content ||
        !content.trim()
      ) {
        return res
          .status(400)
          .json({
            message:
              "Comment required",
          });
      }

      const user =
        await User.findById(
          req.user
        );

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              "User not found",
          });
      }

      const tweet =
        await Tweet.findById(
          tweetId
        );

      if (!tweet) {
        return res
          .status(404)
          .json({
            message:
              "Tweet not found",
          });
      }

      const newComment = {
        userId: user._id,
        content,
        createdAt: new Date(),
      };

      tweet.comments.unshift(
        newComment
      );

      await tweet.save();

      res.status(200).json({
        success: true,

        comment:
          tweet.comments[0],

        commentsCount:
          tweet.comments.length,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Error adding comment",
      });
    }
  };

tweetController.getComments =async (req, res) => {
    try {
      const { tweetId } =
        req.params;
      const tweet =
        await Tweet.findById(
          tweetId
        ).populate(
          "comments.userId",
          "username profilePicture"
          );

      if (!tweet) {
        return res
          .status(404)
          .json({
            message:
              "Tweet not found",
          });
      }

      const comments =
        tweet.comments.sort(
          (a, b) =>
            new Date(
              b.createdAt
            ) -
            new Date(
              a.createdAt
            )
        );

        console.log(comments)

      res.status(200).json({
        comments,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message:
          "Error fetching comments",
      });
    }
  };

tweetController.reportTweet=async (req,res)=>{
    const {id,userId}=req.body;
    userId=req.user;
     console.log("reported",id,"by",userId)
   
    try {
         const user = await User.findById(req.user); // Find the user by ID
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        console.log(user);
        const tweet=await Tweet.findById(id);
        if(!tweet) return res.status(404).json({message:"tweet not found"});
        await Tweet.findByIdAndUpdate(id,{ $addToSet: { reports: userId}});
        res.status(200).json({ message: "Tweet reported", tweet });
        console.log(tweet);
    } catch (error) {
         console.error(error);

   return res.status(500).json({
      message: "Internal server error"
   });
    }
}

module.exports=tweetController;
