const Router =
  require("express")
    .Router();

const auth =
  require("../middleware/auth.middleware");

const conversationControllers =
  require("../controllers/conversation.controllers");


// CREATE OR FIND
// CONVERSATION

Router.post(
  "/conversation",
  auth,
  conversationControllers
    .createOrGetConversation
);


// GET INBOX

Router.get(
  "/conversations",
  auth,
  conversationControllers
    .getConversations
);

module.exports =
  Router;