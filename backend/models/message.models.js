const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");

const MessageSchema=new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    text:{
        type:String,
    },
   
},{timestamps:true});

const MessageModel=mongoose.model("message",MessageSchema);
module.exports=MessageModel;