const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controllers');
const auth = require('../middleware/auth.middleware');
const adminauth = require("../middleware/adminauth.middleware")

router.delete('/tweet/:id', auth,adminauth, adminCtrl.deleteTweet);

module.exports = router;
