const Users = require("../models/users");

exports.signupHandler = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    await Users.create({
      fullName,
      email,
      password,
    });
    return res.json(
      {
        success: true,
        message: "Signup Successful",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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

exports.loginHandler = async (req, res) => {
  try {
    const { email, password } = req.body;
    const token = await Users.matchPassword(email, password);

    return res.cookie("token", token).json(
      {
        success: true,
        message: "Login Successful",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
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