const Users = require("../models/users");
const { sendOTP, generateOTP } = require("../utils/otp");

const failedAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 3;

exports.otpSend = async (req, res) => {
  try {
    const user = await Users.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = generateOTP();
    user.otp = otp.toString();
    user.otpExpiry = Date.now() + 10 * 60 * 1000;

    await Users.findByIdAndUpdate(req.user._id, user, {
      new: true,
      runValidators: true,
    });

    await sendOTP(user.email, otp);

    failedAttempts.delete(req.user._id);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: "10 minutes"
    });

  } catch (error) {
    console.error('OTP Send Error:', error);
    
    if (error.message === 'Too many OTP requests. Please try again later.') {
      return res.status(429).json({
        success: false,
        message: error.message
      });
    }

    if (error.message === 'Failed to send OTP email') {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again later."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error while sending OTP"
    });
  }
};

exports.otpValidate = async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required"
      });
    }

    const user = await Users.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const attempts = failedAttempts.get(req.user._id) || 0;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP."
      });
    }

    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "No active OTP found. Please request a new one."
      });
    }

    if (user.otpExpiry < Date.now()) {
      await Users.findByIdAndUpdate(req.user._id, {
        otp: "",
        otpExpiry: null
      });
      
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    if (user.otp !== otp) {
      failedAttempts.set(req.user._id, attempts + 1);
      
      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${MAX_FAILED_ATTEMPTS - (attempts + 1)} attempts remaining.`
      });
    }

    await Users.findByIdAndUpdate(req.user._id, {
      otp: "",
      otpExpiry: null,
      isVerified: true
    }, {
      new: true,
      runValidators: true
    });

    failedAttempts.delete(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error('OTP Validation Error:', error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while validating OTP"
    });
  }
};

setInterval(() => {
  failedAttempts.clear();
}, 60 * 60 * 1000);