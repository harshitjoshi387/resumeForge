const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../models");
const User = db.user;


exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email aur password zaroori hain" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Is email se user pehle se registered hai" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User successfully registered",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email aur password zaroori hain" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Galat password" });
    }

    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login successful",
      user: { id: existingUser.id, name: existingUser.name, email: existingUser.email },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email zaroori hai" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({ message: "Is email se koi user registered nahi hai" });
    }

    // Random reset token banao
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token ko database mein save karo (15 minute valid)
    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await existingUser.save();

    // Yahan aap email bhej sakte ho nodemailer se (neeche note dekho)
    // Filhaal testing ke liye token response mein bhej rahe hain
    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password/${resetToken}`;

    return res.status(200).json({
      message: "Password reset link generate ho gaya",
      resetUrl, // Production mein isse email se bhejo, response mein mat bhejo
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // ya req.body se le sakte ho
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Naya password zaroori hai" });
    }

    const existingUser = await User.findOne({
      where: {
        resetPasswordToken: token,
      },
    });

    if (!existingUser) {
      return res.status(400).json({ message: "Token invalid hai" });
    }

    // Token expire to nahi hua check karo
    if (existingUser.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Token expire ho chuka hai, dobara request karo" });
    }

    // Naya password hash karke save karo
    const hashedPassword = await bcrypt.hash(password, 10);
    existingUser.password = hashedPassword;
    existingUser.resetPasswordToken = null;
    existingUser.resetPasswordExpires = null;
    await existingUser.save();

    return res.status(200).json({ message: "Password successfully reset ho gaya" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};