const bcrypt = require("bcryptjs");
const db = require("../models");
const User = db.user;

// ==================== GET CURRENT USER ====================
exports.getMe = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password", "resetPasswordToken", "resetPasswordExpires"] },
    });

    if (!currentUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    return res.status(200).json({ user: currentUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== UPDATE CURRENT USER ====================
exports.updateMe = async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;

    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    // Agar email change ho raha hai, check karo pehle se koi aur use to nahi kar raha
    if (email && email !== currentUser.email) {
      const emailTaken = await User.findOne({ where: { email } });
      if (emailTaken) {
        return res.status(409).json({ message: "Ye email pehle se kisi aur account mein use ho raha hai" });
      }
      currentUser.email = email;
    }

    if (name) currentUser.name = name;
    if (photo) currentUser.photo = photo;

    // Password change karna ho to hash karke save karo
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      currentUser.password = hashedPassword;
    }

    await currentUser.save();

    return res.status(200).json({
      message: "Profile update ho gaya",
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        photo: currentUser.photo,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==================== DELETE CURRENT USER ====================
exports.deleteMe = async (req, res) => {
  try {
    const currentUser = await User.findByPk(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ message: "User nahi mila" });
    }

    await currentUser.destroy();

    return res.status(200).json({ message: "Account successfully delete ho gaya" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};