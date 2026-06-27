const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");

const MessageSchema=new mongoose.Schema({
    conversationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"conversation",
        required:true
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    cipherText:{
        type:String,
        required:true
    },
    sessionId:{
        type:String,
        // required:true
    },
    encyptionVersion:{
        type:Number,
        default:1
    },
    messageType:{
        type:String,
        enum:["text","image","video","file"],
        default:"text"
    },
    image:{
        type:String,
    },
    seen:{
        type:Boolean,
        default:false
    },
    messageNumber:{
        type:Number,
        required:true
    },
    nonce:{
        type:String,
        required:true
    },
    delivered: {
        type: Boolean,
        default: false,
    },

    deliveredAt: Date,

    seenAt: Date,
    previousChainLength:{
        type:Number,
        required:true
    }
},{timestamps:true});

MessageSchema.index({ conversationId: 1, createdAt: -1 }); 
MessageSchema.index(
{
  conversationId:1,
  senderId:1,
  messageNumber:1
},
{
  unique:true
});
const MessageModel=mongoose.model("message",MessageSchema);
module.exports=MessageModel;