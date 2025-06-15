const router = require('express').Router();
const adminCtrl = require('../controllers/admin.controllers');
const auth = require('../middleware/auth.middleware');

router.delete('/tweet/:id', auth, adminCtrl.deleteTweet);

module.exports = router;
