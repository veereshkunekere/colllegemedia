const mongoose =
  require("mongoose");

const ConversationModel =
  require("../models/conversation.models");

const User =
  require("../models/user.models");

const conversationControllers =
  {};


// CREATE OR FIND
// CONVERSATION

conversationControllers.createOrGetConversation = async (req, res) => {
    try {
      const myId = req.user;

      const {
        receiverId,
      } = req.body;
      console.log("Received receiverId:", receiverId, "from user:", myId);

      if (!receiverId) {
        return res
          .status(400)
          .json({
            error:
              "receiverId required",
          });
      }

      if ( myId === receiverId ) {
        return res
          .status(400)
          .json({
            error:
              "Cannot message yourself",
          });
      }

      // CHECK USER EXISTS

      const receiver = await User.findById( receiverId );

      if (!receiver) {
        return res
          .status(404)
          .json({
            error:
              "Receiver not found",
          });
      }

      // Ensure receiver is verified before allowing conversation creation
      if (!receiver.isVerified) {
        return res.status(400).json({
          error: "User not verified",
        });
      }

      // FIND EXISTING
      // CONVERSATION
      const myObjectId = new mongoose.Types.ObjectId(myId);
const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

let conversation = await ConversationModel.findOne({
  participants: {
    $all: [myObjectId, receiverObjectId],
    $size: 2
  }
});

      // CREATE IF NOT EXISTS

      if ( !conversation ) {
        conversation =
          new ConversationModel(
            {
              participants:
                [
                  myId,
                  receiverId,
                ],

              unreadCounts:
                {
                  [myId]:
                    0,

                  [receiverId]:
                    0,
                },
                 createdBy: myId,
            }
          );

        await conversation.save();
      }
      conversation =
  await ConversationModel
    .findById(conversation._id)
    .populate(
      "participants",
      "username profilePicture"
    );

      return res
        .status(200)
        .json({
          conversation,
        });
    } catch (error) {
      console.log(
        "create conversation error",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Internal server error",
        });
    }
  };



// GET USER
// CONVERSATIONS

conversationControllers.getConversations = async (req, res) => {
    try {
      const myId = req.user;

      const conversations = await ConversationModel.find(
          {
            participants:
              myId,
          }
        ).populate(
            "participants",
            "username profilePicture"
          ).populate(
            "lastMessageSender",
            "username"
          ).sort({
            lastMessageAt:
              -1,
          });

      return res
        .status(200)
        .json({
          conversations,
        });
    } catch (error) {
      console.log(
        "get conversations error",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Internal server error",
        });
    }
  };

module.exports = conversationControllers;
