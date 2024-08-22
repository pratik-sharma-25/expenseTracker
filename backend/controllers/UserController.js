const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const createLog = require("./LoggerController");

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    createLog("Fields missing", "error");
    return res.status(400).json({ message: "All fields are required" });
  }

  const userData = await UserModel.findOne({
    email,
  });

  if (!userData) {
    createLog("User does not exist", "error", {email});
    return res.status(404).json({ message: "User does not exist" });
  }

  if (userData.password !== password) {
    createLog("Password incorrect", "error", {email});
    return res.status(400).json({ message: "Password is incorrect" });
  }

  const user = { user: userData };
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  return res.json({
    accessToken,
    message: "user logged in",
    error: false,
    user,
  });
};

const createUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password) {
    createLog("Fields missing", "error", {firstName, lastName, email, password});
    return res.status(400).json({ message: "All fields are required" });
  }

  const isUserExist = await UserModel.findOne({ email });
  if (isUserExist) {
    createLog("User already exists", "error", {email});
    return res.status(400).json({ message: "User already exists" });
  }

  try {
    const userData = new UserModel({
      firstName,
      lastName,
      email,
      password, // Ensure to hash the password before saving in a real application
    });

    const user = { user: userData };
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    await userData.save();
    res.status(201).json({
      message: "User created successfully",
      accessToken,
      error: false,
      user,
    });
  } catch (error) {
    createLog('Error in user creation', "fatal", {message: error.message});
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  loginUser,
  createUser,
};
