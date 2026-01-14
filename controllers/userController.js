import User from "../models/User.js";
import tokenService from "../services/tokenService.js";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.validatedData;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        message:
          "This username or email is already registered. Please try another.",
      });
    }

    const user = new User({ username, email, password });
    await user.save();

    const accessToken = tokenService.generateAccessToken(user._id);
    const refreshToken = tokenService.generateRefreshToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    throw error;
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.validatedData;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect. Please try again." });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect. Please try again." });
    }

    const accessToken = tokenService.generateAccessToken(user._id);
    const refreshToken = tokenService.generateRefreshToken(user._id);

    res.json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    throw error;
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid or expired refresh token. Please login again.",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found. Please login again." });
    }

    const accessToken = tokenService.generateAccessToken(user._id);

    res.json({
      message: "Access token refreshed successfully",
      accessToken,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    throw error;
  }
};

const logout = async (req, res) => {
  try {
    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    throw error;
  }
};

export { register, login, refreshToken, logout };
