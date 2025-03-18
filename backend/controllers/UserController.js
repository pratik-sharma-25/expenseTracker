const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const createLog = require("./LoggerController");
const bcrypt = require('bcrypt');

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

  // check user password matches with bcrypt
  const isPaswordMatch = await bcrypt.compare(password, userData.password);

  if (!isPaswordMatch) {
    createLog("Password incorrect", "error", {email});
    return res.status(400).json({ message: "Password is incorrect" });
  }

  userData.password = undefined;
  const user = userData
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });

   // don't send password in response
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userInformation = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
    }
    const userData = new UserModel(userInformation);

    const user = userData;
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    await userData.save();

    delete userInformation.password; // don't send password in response

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      error: false,
      user: userInformation,
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
