const express = require('express')

const router = express.Router()

const loginController = require('../controllers/loginController')
const logoutController = require('../controllers/logoutController')
const otpController = require('../controllers/otpController')

router.post('/sign-up', loginController.signupHandler);
router.post('/login', loginController.loginHandler);
router.get('/logout', logoutController.logoutHandler);
router.post('/send-otp', otpController.otpSend);
router.post('/validate-otp', otpController.otpValidate);

module.exports = router;