const Users = require("../models/users");

exports.signupHandler = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  try {
    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }

    await Users.create({
      fullName,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Signup Successful"
    });

  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      success: false,
      message: "Error creating user account"
    });
  }
};

exports.loginHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    const token = await Users.matchPassword(email, password);
    
    return res.cookie("token", token).status(200).json({
      success: true,
      message: "Login Successful"
    });

  } catch (error) {
    if (error.message === "User not found") {
      return res.status(404).json({
        success: false,
        message: "No account found with this email"
      });
    }
    if (error.message === "Invalid password") {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Error during login"
    });
  }
};