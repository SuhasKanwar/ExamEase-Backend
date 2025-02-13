const Users = require("../models/users");
const { sendOTP, generateOTP } = require("../utils/otp");

exports.otpSend = async (req, res) => {
  try{
    const user = await Users.findById(req.user._id);

    if(!user){
      return res.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        }
      );
    }
  
    const otp = generateOTP();
  
    user.otp = otp.toString();
  
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
  
    await Users.findByIdAndUpdate(req.user._id, user, {
      new: true,
      runValidators: true,
    });
  
    await sendOTP(req.user.email, otp);
  
    return res.json(
      {
        success: true,
        message: "OTP Sent",
      },
      {
        status: 200,
      }
    );
  }
  catch(error){
    return res.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
};

exports.otpValidate = async (req, res) => {
  const enteredOTP = req.body.otp;

  const user = await Users.findById(req.user._id);

  if(user.otp !== enteredOTP || user.otpExpiry < Date.now()) {
    return res.json(
      {
        success: false,
        message: "Invalid OTP or OTP expired",
      },
      {
        status: 400,
      }
    );
  }

  if(user.otp === enteredOTP && user.otpExpiry > Date.now()) {
    user.otp = "";
    user.otpExpiry = null;

    await Users.findByIdAndUpdate(req.user._id, user, {
      new: true,
      runValidators: true,
    });

    return res.json(
      {
        success: true,
        message: "OTP Verified",
      },
      {
        status: 200,
      }
    );
  }
};