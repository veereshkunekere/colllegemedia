const tweetController = require("../controllers/tweet.controllers");
const auth = require('../middleware/auth.middleware');
const upload=require("../middleware/upload")
const Router=require("express").Router();

Router.post("/",auth,upload.single("image"),tweetController.makeAtweet);

Router.get("/tweetFeed",auth,tweetController.getTweets);

Router.post("/tweetlike",auth,tweetController.likeATweet);

Router.post("/reportTweet",auth,tweetController.reportTweet);

module.exports=Router;