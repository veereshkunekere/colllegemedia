const tweetController = require("../controllers/tweet.controllers");
const auth = require('../middleware/auth.middleware');
const {uploadTweetImage}=require("../middleware/upload")
const Router=require("express").Router();
const idempotency =require("../middleware/idompotency.middleware");
// Router.post("/",auth,upload.array(),tweetController.makeAtweet);

Router.post(
  "/create",
  auth,
  idempotency,
  uploadTweetImage,          // <-- now .array()
  tweetController.makeAtweet
);

Router.get("/tweetFeed",auth,tweetController.getTweets);

Router.post("/tweetlike",auth,tweetController.likeATweet);

Router.get("/comments/:tweetId",auth,tweetController.getComments);

Router.post("/comment",auth,idempotency,tweetController.addComment);

Router.post("/reportTweet",auth,idempotency,tweetController.reportTweet);

Router.get("/user/:userId",auth,tweetController.getTweetsByUser);

Router.delete("/:tweetId", auth, tweetController.deleteTweet);

Router.delete("/comment/:tweetId/:commentId", auth, tweetController.deleteComment);

module.exports=Router;