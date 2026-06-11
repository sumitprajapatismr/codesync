const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/* =========================
   REGISTER USER
========================= */
const registerUser = async (req, res, next) => {
  const { name, email, password, avatar } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      password, // assume schema hashes it (pre-save hook)
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        rating: user.rating,
        solvedProblems: user.solvedProblems,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed"
    });
  }
};

/* =========================
   LOGIN USER
========================= */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        rating: user.rating,
        solvedProblems: user.solvedProblems,
        token: generateToken(user._id)
      }
    });

  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed"
    });
  }
};

/* =========================
   GET CURRENT USER
========================= */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('solvedProblems')
      .populate('friends', 'name email avatar rating')
      .populate('friendRequests', 'name email avatar rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.log("GetMe Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
