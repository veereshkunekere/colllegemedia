const Router = require("express").Router();
const messagesControllers = require("../controllers/messages.controllers");
const auth = require("../middleware/auth.middleware");

Router.get("/getContacts", auth, messagesControllers.getMessagedContacts);  // Updated to match controller function name
// Router.get("/getChats/:id", auth, messagesControllers.getChats); //this is non e2ee route
Router.post("/sendMessage", auth, messagesControllers.sendMessage);
Router.get("/isOnline/:id", auth, messagesControllers.isOnline);
Router.get("/:conversationId",auth,messagesControllers.getMessages);

module.exports = Router;