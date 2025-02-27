const Users = require("../models/users");

exports.signupHandler = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    await Users.create({
      fullName,
      email,
      password,
    });
    return res.status(200).json(
      {
        success: true,
        message: "Signup Successful",
      }
    );
  } catch (error) {
    return res.status(500).json(
      {
        success: false,
        message: "Internal Server Error",
      }
    );
  }
};

exports.loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await Users.matchPassword(email, password);

    return res.cookie("token", token).status(200).json(
      {
        success: true,
        message: "Login Successful",
      }
    );
  } catch (error) {
    return res.status(500).json(
      {
        success: false,
        message: "Internal Server Error",
      }
    );
  }
};