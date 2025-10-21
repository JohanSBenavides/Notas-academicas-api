const express = require('express');
const router = express.Router();
const authCtrl = require('../Controllers/auth.controller');


router.post('/login', authCtrl.login);


module.exports = router;