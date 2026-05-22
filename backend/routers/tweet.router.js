const tweetController = require("../controllers/tweet.controllers");
const auth = require('../middleware/auth.middleware');
const {uploadTweetImage}=require("../middleware/upload")
const Router=require("express").Router();

// Router.post("/",auth,upload.array(),tweetController.makeAtweet);

Router.post(
  "/create",
  auth,
  uploadTweetImage,          // <-- now .array()
  tweetController.makeAtweet
);

Router.get("/tweetFeed",auth,tweetController.getTweets);

Router.post("/tweetlike",auth,tweetController.likeATweet);

Router.get("/comments/:tweetId",auth,tweetController.getComments);

Router.post("/comment",auth,tweetController.addComment);

Router.post("/reportTweet",auth,tweetController.reportTweet);

module.exports=Router;