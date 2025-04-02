const express = require('express')
const router = express.Router()

const loginController = require('../controllers/loginController')
const logoutController = require('../controllers/logoutController')
const otpController = require('../controllers/otpController')
const { requireAuth } = require('../middlewares/authentication')

router.post('/sign-up', loginController.signupHandler);
router.post('/login', loginController.loginHandler);

router.get('/logout', requireAuth, logoutController.logoutHandler);
router.post('/send-otp', requireAuth, otpController.otpSend);
router.post('/validate-otp', requireAuth, otpController.otpValidate);

module.exports = router;