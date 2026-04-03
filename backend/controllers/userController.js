// controllers/userController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register User (Adapted to your schema)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate password strength
    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Validate role (match your schema's capitalized enum values)
    const validRoles = ["buyer", "seller", "admin"];
    const userRole = role && validRoles.includes(role) ? role : "buyer";

    // Check if user already exists (email will be lowercase due to schema setter)
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name, // Will be converted to lowercase by schema setter
      email, // Will be converted to lowercase by schema setter
      password: hashedPassword,
      role: userRole,
      authProvider: "local",
    });

    const savedUser = await newUser.save();

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
};

// Update login to match schema
const loginRoute = async (req, res) => {
  try {
    const { email, password, loginType } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ❗ Block Google users
    if (!user.password) {
      return res.status(400).json({
        message:
          "This account was created using Google. Please login with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // ROLE vs LOGIN TYPE CHECK
    if (loginType === "buyer" && user.role === "seller") {
      return res.status(403).json({
        message: "Please login from Seller Login page",
      });
    }

    if (loginType === "seller" && user.role !== "seller") {
      return res.status(403).json({
        message: "You are not approved as a seller",
      });
    }

    // ✅ Ensure authProvider consistency
    if (!user.authProvider) {
      user.authProvider = "local";
      await user.save();
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: !!user.password, // ✅ ALWAYS DERIVED
        role: user.role,
        profilePicUrl: user.profilePicUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: true,
        role: user.role,
        profilePicUrl: user.profilePicUrl,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Google Login
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();
    const name = payload.name.toLowerCase();

    let user = await User.findOne({ email });

    //  If first-time Google user
    if (!user) {
      user = await User.create({
        name,
        email,
        role: "buyer", //  DEFAULT ROLE
        authProvider: "google",
      });
    }

    if (user.authProvider !== "google") {
      user.authProvider = "google";
      await user.save();
    }

    // 🔐 Create your app JWT
    const jwtToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasPassword: !!user.password, // FIX
        role: user.role,
        profilePicUrl: user.profilePicUrl,
      },
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Google authentication failed" });
  }
};

// Add this new function to userController.js
const checkUser = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Please register first." });
    }

    // Role-specific validation
    if (role && user.role !== role) {
      if (role === "seller") {
        return res.status(403).json({
          message:
            "You are not approved as a seller. Please register as a seller first.",
        });
      }
      return res.status(403).json({
        message: `Please use the ${user.role} login page`,
      });
    }

    // Check if user is a Google-only user
    if (user.authProvider === "google" && !user.password) {
      return res.status(200).json({
        message: "Google user detected",
        user: {
          id: user._id,
          email: user.email,
          authProvider: "google",
          hasPassword: false,
          role: user.role,
        },
      });
    }

    return res.status(200).json({
      message: "User found",
      user: {
        id: user._id,
        email: user.email,
        hasPassword: !!user.password,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    console.error("Check user error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Keep other functions updated for consistency
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const validRoles = ["buyer", "seller", "admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

const updateProfilePicture = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      id,
      { profilePicUrl: imageUrl },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile picture updated",
      profilePicUrl: user.profilePicUrl,
    });
  } catch (err) {
    console.error("Profile pic error: ", err);
    res.status(500).json({ error: "Failed to update profile picture" });
  }
};

// Update logged-in user's profile (name only)
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: "New password is required" });
    }

    // Strong password validation
    const strongPasswordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!strongPasswordPattern.test(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters and include:\n" +
          "- Uppercase letter\n" +
          "- Lowercase letter\n" +
          "- Number\n" +
          "- Special character",
      });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // If user already has password, verify current password
    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ error: "Current password is required" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.authProvider = "local";
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

module.exports = {
  getUsers,
  loginRoute,
  adminLogin,
  googleLogin,
  addUser: registerUser,
  updateProfilePicture,
  updateUser,
  deleteUser,
  updateProfile,
  changePassword,
  checkUser,
};
