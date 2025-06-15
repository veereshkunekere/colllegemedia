const uploadsController = require("../controllers/uploads.controllers");
const auth = require('../middleware/auth.middleware');
const Router=require("express").Router();
const upload=require("../middleware/upload");

Router.post("/upload-file",auth,upload.single('file'),uploadsController.upload);

Router.get("/type/:cat",auth,uploadsController.getUploadsByCategeory);

Router.get("/user/:uid",auth,uploadsController.getUploadsByUserId);

Router.get("/",auth,uploadsController.getUserUploads);

// Router.get("/:id",auth,uploadsController.getUploadByUploadId);

Router.delete("/:id",auth,uploadsController.deleteUploads);


module.exports=Router;